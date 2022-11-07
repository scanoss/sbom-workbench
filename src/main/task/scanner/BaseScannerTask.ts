import {
  Scanner,
  SbomMode,
  ScannerCfg,
  ScannerEvents,
  ScannerInput,
  WinnowingMode,
} from 'scanoss';
import fs from 'fs';
import log from 'electron-log';
import { ScanState } from '../../../api/types';
import { Project } from '../../workspace/Project';
import { IpcChannels } from '../../../api/ipc-channels';
import { fileService } from '../../services/FileService';
import { fileHelper } from '../../helpers/FileHelper';
import { resultService } from '../../services/ResultService';
import { componentService } from '../../services/ComponentService';
import { userSettingService } from '../../services/UserSettingService';
import AppConfig from '../../../config/AppConfigModule';
import { AutoAccept } from '../inventory/AutoAccept';
import { broadcastManager } from '../../broadcastManager/BroadcastManager';
import { Scanner as ScannerModule } from './types';

export abstract class BaseScannerTask implements ScannerModule.IPipelineTask {
  protected scanner: Scanner;

  protected scannerState: ScanState;

  protected project: Project;

  public abstract getStageProperties(): ScannerModule.StageProperties;

  constructor(project: Project) {
    this.project = project;
  }

  protected sendToUI(eventName, data: any) {
    broadcastManager.get().send(eventName, data);
  }

  public abstract set(): Promise<void>;

  public async init() {
    this.setScannerConfig();
    this.cleanWorkDirectory();
    this.scanner.on(ScannerEvents.DISPATCHER_NEW_DATA, async (response) => {
      this.project.processedFiles += response.getNumberOfFilesScanned();
      const filesScanned = response.getFilesScanned();
      // eslint-disable-next-line no-restricted-syntax
      for (const file of filesScanned)
        delete this.project.filesToScan[`${this.project.getScanRoot()}${file}`];
      this.sendToUI(IpcChannels.SCANNER_UPDATE_STATUS, {
        processed:
          (100 * this.project.processedFiles) /
          this.project.filesSummary.include,
      });
      await this.project.save();
    });

    this.scanner.on(
      ScannerEvents.RESULTS_APPENDED,
      (response, filesNotScanned) => {
        this.project.tree.attachResults(response.getServerResponse());
        Object.assign(
          this.project.filesNotScanned,
          this.project.filesNotScanned
        );
        this.project.save();
      }
    );

    this.scanner.on(
      ScannerEvents.SCAN_DONE,
      async (resultPath, filesNotScanned) => {
        log.info(`%cScannerEvents.SCAN_DONE`, 'color: green');
      }
    );

    this.scanner.on(ScannerEvents.SCANNER_LOG, (message, level) => {
      log.info(`%c${message}`, 'color: green');
    });

    this.scanner.on('error', async (error) => {
      this.project.save();
      await this.project.close();
      this.sendToUI(IpcChannels.SCANNER_ERROR_STATUS, error);
    });
  }

  public async done() {
    const resultPath = `${this.project.getMyPath()}/result.json`;
    await fileService.insert(this.project.getTree().getRootFolder().getFiles());
    const files = await fileHelper.getPathFileId();
    await resultService.insertFromFile(resultPath, files);
    await componentService.importComponents();

    this.project.metadata.setScannerState(ScanState.FINISHED);
    this.project.metadata.save();

    if (AppConfig.FF_ENABLE_AUTO_ACCEPT_AFTER_SCAN) {
      const autoAccept = new AutoAccept();
      await autoAccept.run();
    }
  }

  protected setScannerConfig() {
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

  public async run(): Promise<boolean> {
    log.info('[ BaseScannerTask init scanner]');
    await this.set();
    await this.init();
    await this.scan();
    await this.done();
    this.project.save();
    return true;
  }

  private async scan() {
    const scanIn = this.adapterToScannerInput(this.project.filesToScan);
    await this.scanner.scan(scanIn);
  }

  protected adapterToScannerInput(
    filesToScan: Record<string, string>
  ): Array<ScannerInput> {
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
      const sbom = fs.readFileSync(`${rootPath}/scanoss-ignore.json`, 'utf-8');

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
}
