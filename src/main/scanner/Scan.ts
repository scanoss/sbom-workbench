import log from 'electron-log';
import { DependencyScanner, Scanner, ScannerCfg, ScannerEvents, ScannerInput, WinnowingMode } from 'scanoss';
import fs from 'fs';
import { IpcEvents } from '../../api/ipc-events';
import { ScanState } from '../../api/types';
import { fileHelper } from '../helpers/FileHelper';
import { componentService } from '../services/ComponentService';
import { dependencyService } from '../services/DependencyService';
import { fileService } from '../services/FileService';
import { resultService } from '../services/ResultService';
import { userSettingService } from '../services/UserSettingService';
import { ScanHandler } from './ScanHandler';
import { Project } from '../workspace/Project';

export class Scan extends ScanHandler {
  constructor(project: Project, msgToUI: Electron.WebContents) {
    super(project, msgToUI);
    this.project.metadata.setScannerState(ScanState.SCANNING);
  }

  public async init() {
    this.setScannerConfig();
    this.cleanWorkDirectory();
    this.scanner.on(ScannerEvents.DISPATCHER_NEW_DATA, async (response) => {
      this.project.processedFiles += response.getNumberOfFilesScanned();
      const filesScanned = response.getFilesScanned();
      // eslint-disable-next-line no-restricted-syntax
      for (const file of filesScanned) delete this.project.filesToScan[`${this.project.getScanRoot()}${file}`];
      this.sendToUI(IpcEvents.SCANNER_UPDATE_STATUS, {
        stage: ScanState.SCANNING,
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
      log.info(`%c[ SCANNER ]: Start scanning dependencies`, 'color: green');
      await this.scanDependencies();
      this.project.metadata.setScannerState(ScanState.FINISHED);
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

  public async scan() {
    this.sendToUI(IpcEvents.SCANNER_UPDATE_STATUS, {
      stage: this.project.metadata.getScannerState(),
      processed: 0,
    });
    this.sendToUI(IpcEvents.SCANNER_UPDATE_STATUS, {
      stage: this.project.metadata.getScannerState(),
      processed: 0,
    });
    const scanIn = this.adapterToScannerInput(this.project.filesToScan);
    this.scanner.scan(scanIn);
  }

  private adapterToScannerInput(filesToScan: Record<string, string>): Array<ScannerInput> {
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
    return result;
  }

  public cleanWorkDirectory() {
    this.scanner.cleanWorkDirectory();
  }

  public async scanDependencies(): Promise<void> {
    const allFiles = [];
    const rootPath = this.project.metadata.getScanRoot();
    this.project
      .getTree()
      .getRootFolder()
      .getFiles()
      .forEach((f: File) => {
        allFiles.push(rootPath + f.path);
      });

    try {
      const dependencies = await new DependencyScanner().scan(allFiles);
      dependencies.filesList.forEach((f) => {
        f.file = f.file.replace(rootPath, '');
      });
      fs.promises.writeFile(
        `${this.project.metadata.getMyPath()}/dependencies.json`,
        JSON.stringify(dependencies, null, 2)
      );
      this.project.getTree().addDependencies(dependencies);
      this.project.save();
      await dependencyService.insert(dependencies);
    } catch (e) {
      log.error(e);
    }
  }
}
