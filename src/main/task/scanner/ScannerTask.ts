import { EventEmitter } from 'events';
import { DependencyScanner, Scanner, SbomMode, ScannerCfg, ScannerEvents, ScannerInput, WinnowingMode } from 'scanoss';
import fs from 'fs';
import log from 'electron-log';
import { INewProject, ScanState } from '../../../api/types';
import { dependencyService } from '../../services/DependencyService';
import { Project } from '../../workspace/Project';
import { IpcEvents } from '../../../api/ipc-events';
import { fileService } from '../../services/FileService';
import { fileHelper } from '../../helpers/FileHelper';
import { resultService } from '../../services/ResultService';
import { componentService } from '../../services/ComponentService';
import { userSettingService } from '../../services/UserSettingService';
import AppConfig from '../../../config/AppConfigModule';
import { AutoAccept } from '../inventory/AutoAccept';
import { ITask } from '../Task';
import { IndexTask } from "../search/indexTask/IndexTask";
import { BlackListDependencies } from "../../workspace/tree/blackList/BlackListDependencies";
import {AllFiles} from "../../workspace/tree/blackList/BlackListFalse";

export abstract class ScannerTask extends EventEmitter implements ITask<void, boolean> {
  protected msgToUI!: Electron.WebContents;

  protected scanner: Scanner;

  protected scannerState: ScanState;

  protected project: Project;

  constructor(msgToUI: Electron.WebContents) {
    super();
    this.msgToUI = msgToUI;
  }

  protected sendToUI(eventName, data: any) {
    if (this.msgToUI) this.msgToUI.send(eventName, data);
  }

  public abstract set(project: INewProject | string): Promise<void>;

  public async init() {
    this.setScannerConfig();
    this.cleanWorkDirectory();
    this.scanner.on(ScannerEvents.DISPATCHER_NEW_DATA, async (response) => {
      this.project.processedFiles += response.getNumberOfFilesScanned();
      const filesScanned = response.getFilesScanned();
      // eslint-disable-next-line no-restricted-syntax
      for (const file of filesScanned) delete this.project.filesToScan[`${this.project.getScanRoot()}${file}`];
      this.sendToUI(IpcEvents.SCANNER_UPDATE_STATUS, {
        stage: {
          stageName: ScanState.SCANNING,
          stageStep: 2,
        },
        processed: (100 * this.project.processedFiles) / this.project.filesSummary.include,
      });
    });

    this.scanner.on(ScannerEvents.RESULTS_APPENDED, (response, filesNotScanned) => {
      this.project.tree.attachResults(response.getServerResponse());
      Object.assign(this.project.filesNotScanned, this.project.filesNotScanned);
      this.project.save();
    });

    this.scanner.on(ScannerEvents.SCAN_DONE, async (resultPath, filesNotScanned) => {
      await this.done(resultPath);
      await new IndexTask().run(this.msgToUI);
      await this.addDependencies();
      this.project.metadata.setScannerState(ScanState.FINISHED);
      this.project.metadata.save();
      if (AppConfig.FF_ENABLE_AUTO_ACCEPT_AFTER_SCAN) {
        const autoAccept = new AutoAccept();
        await autoAccept.run();
      }
      this.project.metadata.save();
      this.sendToUI(IpcEvents.SCANNER_FINISH_SCAN, {
        success: true,
        resultsPath: this.project.metadata.getMyPath(),
      });
      await this.project.close();
    });

    this.scanner.on(ScannerEvents.SCANNER_LOG, (message, level) => {
      log.info(`%c${message}`, 'color: green');
    });

    this.scanner.on('error', async (error) => {
      this.project.save();
      await this.project.close();
      this.sendToUI(IpcEvents.SCANNER_ERROR_STATUS, error);
    });
  }

  public async done(resultPath: string) {
    await fileService.insert(this.project.getTree().getRootFolder().getFiles());
    const files = await fileHelper.getPathFileId();
    await resultService.insertFromFile(resultPath, files);
    await componentService.importComponents();
  }

  private setScannerConfig() {
    const scannerCfg: ScannerCfg = new ScannerCfg();
    const { DEFAULT_API_INDEX, APIS } = userSettingService.get();

    if (this.project.getApi()) {
      scannerCfg.API_URL = this.project.getApi();
      scannerCfg.API_KEY = this.project.getApiKey();
    } else {
      scannerCfg.API_URL = APIS[DEFAULT_API_INDEX].URL;
      scannerCfg.API_KEY = APIS[DEFAULT_API_INDEX].API_KEY;
    }

    scannerCfg.CONCURRENCY_LIMIT = 20;
    scannerCfg.DISPATCHER_QUEUE_SIZE_MAX_LIMIT = 500;
    scannerCfg.DISPATCHER_QUEUE_SIZE_MIN_LIMIT = 450;

    this.scanner = new Scanner(scannerCfg);
    this.project.scanner = this.scanner;
    this.scanner.setWorkDirectory(this.project.getMyPath());
  }

  public scannerStatus() {
    this.sendToUI(IpcEvents.SCANNER_UPDATE_STATUS, {
      stage: {
        stageName:this.project.metadata.getScannerState(),
        stageStep: 2,
      },
      processed: 0,
    });
  }

  public async run() {
    this.scannerStatus();
    const scanIn = this.adapterToScannerInput(this.project.filesToScan);
    await this.scanDependencies();
    this.scanner.scan(scanIn);
    return true;
  }

  private async scanDependencies(): Promise<void> {
    const allFiles = [];
    //
    const rootPath = this.project.metadata.getScanRoot();
    this.project.tree
      .getRootFolder()
      .getFiles(new BlackListDependencies())
      .forEach((f: File) => {
        allFiles.push(rootPath + f.path);
      });

    try {
      const dependencies = await new DependencyScanner().scan(allFiles);
      dependencies.filesList.forEach((f) => {
        f.file = f.file.replace(rootPath, '');
      });
      await fs.promises.writeFile(
        `${this.project.metadata.getMyPath()}/dependencies.json`,
        JSON.stringify(dependencies, null, 2)
      );
    } catch (e) {
      log.error(e);
    }
  }

  protected adapterToScannerInput(filesToScan: Record<string, string>): Array<ScannerInput> {
    const fullScanList: Array<string> = [];
    const quickScanList: Array<string> = [];

    for (const filePath of Object.keys(filesToScan)) {
      if (filesToScan[filePath] === 'MD5_SCAN') {
        quickScanList.push(filePath);
      } else {
        fullScanList.push(filePath);
      }
    }

    const result: Array<ScannerInput> = [];

    if (fullScanList.length > 0) {
      result.push({
        fileList: fullScanList,
        folderRoot: this.project.metadata.getScanRoot(),
        winnowingMode: WinnowingMode.FULL_WINNOWING,
      });
    }

    if (quickScanList.length > 0) {
      result.push({
        fileList: quickScanList,
        folderRoot: this.project.metadata.getScanRoot(),
        winnowingMode: WinnowingMode.WINNOWING_ONLY_MD5,
      });
    }

    // Allows to ignore a list of components from a SBOM place in the root folder
    const rootFolder = this.project.getTree().getRootFolder();
    const rootPath = this.project.getScanRoot();
    if (rootFolder.containsFile('scanoss-ignore.json')) {
      const sbom = fs.readFileSync(`${rootPath}/scanoss-ignore.json`, "utf-8")

      result.forEach((_, index, arr) => {
        arr[index].sbom = sbom;
        arr[index].sbomMode = SbomMode.SBOM_IGNORE;
      });
    }
    return result;
  }

  public cleanWorkDirectory() {
    this.scanner.cleanWorkDirectory();
  }

  public async addDependencies() {
    try {
      const dependencies = JSON.parse(
        await fs.promises.readFile(`${this.project.metadata.getMyPath()}/dependencies.json`, 'utf8')
      );
      this.project.tree.addDependencies(dependencies);
      this.project.save();
      await dependencyService.insert(dependencies);
    } catch (e) {
      log.error(e);
    }
  }
}
