import {
  logger,
  Scanner,
  ScannerCfg,
  ScannerEvents,
  ScannerInput,
} from 'scanoss';
import log from 'electron-log';
import fs from 'fs';
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
import { IDispatch } from './dispatcher/IDispatch';
import { IScannerInputAdapter } from './adapter/IScannerInputAdapter';
import { utilModel } from '../../model/UtilModel';

export abstract class BaseScannerTask<TDispatcher extends IDispatch, TInputScannerAdapter extends IScannerInputAdapter> implements ScannerModule.IPipelineTask {
  protected scanner: Scanner;

  protected scannerState: ScanState;

  protected project: Project;

  protected dispatcher : TDispatcher;

  protected inputAdapter: TInputScannerAdapter;

  protected obfuscationMapper: Record<string, string> = null;

  public abstract getStageProperties(): ScannerModule.StageProperties;

  constructor(project: Project, dispatch: TDispatcher, inputAdapter: TInputScannerAdapter) {
    this.project = project;
    this.dispatcher = dispatch;
    this.inputAdapter = inputAdapter;
  }

  protected sendToUI(eventName, data: any) {
    broadcastManager.get().send(eventName, data);
  }

  public abstract set(): Promise<void>;

  public async init() {
    await this.setScannerConfig();

    let { processedFiles } = this.project;

    this.scanner.on(ScannerEvents.DISPATCHER_NEW_DATA, async (response) => {
      processedFiles += response.getNumberOfFilesScanned();
      for (const file of response.getFilesScanned()) this.dispatcher.dispatch(this.project, file);
      this.sendToUI(IpcChannels.SCANNER_UPDATE_STATUS, {
        processed:
          (100 * processedFiles)
          / this.project.filesSummary.include,
      });
    });

    this.scanner.on(
      ScannerEvents.RESULTS_APPENDED,
      (response, filesNotScanned) => {
        this.project.processedFiles += response.getNumberOfFilesScanned();

        Object.assign(
          this.project.filesNotScanned,
          this.project.filesNotScanned,
        );
        this.project.save();
      },
    );

    this.scanner.on(
      ScannerEvents.SCAN_DONE,
      async (resultPath, filesNotScanned) => {
        log.info('%cScannerEvents.SCAN_DONE', 'color: green');
      },
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
    const result: Record<any, any> = await utilModel.readFile(resultPath);
    this.project.tree.attachResults(result);
    for (const [key, value] of Object.entries(result)) {
      if (!key.startsWith('/')) {
        result[`/${key}`] = value;
        delete result[key];
      }
    }
    await fs.promises.writeFile(resultPath, JSON.stringify(result, null, 2));

    if (AppConfig.FF_ENABLE_AUTO_ACCEPT_AFTER_SCAN) {
      const autoAccept = new AutoAccept();
      await autoAccept.run();
    }
  }

  protected async setScannerConfig() {
    const scannerCfg: ScannerCfg = new ScannerCfg();
    scannerCfg.CLIENT_TIMESTAMP = 'sbom-workbench';

    const {
      DEFAULT_API_INDEX,
      APIS,
      HTTP_PROXY,
      HTTPS_PROXY,
      PAC_PROXY,
      GRPC_PROXY,
      NO_PROXY,
      CA_CERT,
      IGNORE_CERT_ERRORS,
      SCANNER_TIMEOUT,
      SCANNER_POST_SIZE,
      SCANNER_CONCURRENCY_LIMIT,
    } = userSettingService.get();

    if (this.project.getApi()) {
      scannerCfg.API_URL = this.project.getApi() + AppConfig.API_SCAN_PATH;
      scannerCfg.API_KEY = this.project.getApiKey();
    } else {
      scannerCfg.API_URL = APIS[DEFAULT_API_INDEX].URL + AppConfig.API_SCAN_PATH;
      scannerCfg.API_KEY = APIS[DEFAULT_API_INDEX].API_KEY;
    }

    // This parameter allow to keep scanning even when some package has error
    // WARNING: You won't get the results of all yours files.
    // scannerCfg.ABORT_ON_MAX_RETRIES = false

    scannerCfg.WFP_FILE_MAX_SIZE = SCANNER_POST_SIZE * 1024 || 16 * 1024;
    scannerCfg.CONCURRENCY_LIMIT = SCANNER_CONCURRENCY_LIMIT || 5;
    scannerCfg.TIMEOUT = SCANNER_TIMEOUT * 1000 || 300 * 1000;

    scannerCfg.MAX_RESPONSES_IN_BUFFER = 500;

    const PAC_URL = PAC_PROXY ? `pac+${PAC_PROXY.trim()}` : null;
    scannerCfg.HTTP_PROXY = PAC_URL || HTTP_PROXY || '';
    scannerCfg.HTTPS_PROXY = PAC_URL || HTTPS_PROXY || '';
    scannerCfg.NO_PROXY = NO_PROXY ? NO_PROXY.join(',') : null;

    scannerCfg.IGNORE_CERT_ERRORS = IGNORE_CERT_ERRORS || false;
    scannerCfg.CA_CERT = CA_CERT ? CA_CERT : null;


    // Obfuscation
    scannerCfg.WFP_OBFUSCATION = this.project.getDto().scannerConfig.obfuscate;
    scannerCfg.RESULTS_DEOBFUSCATION = this.project.getDto().scannerConfig.obfuscate;

    // Allows Scanoss SDK to write into project.log
    logger.setTransport((msg) => log.info(`%c${msg}`, 'color: green'));

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
    const scanIn = await this.inputAdapter.adapterToScannerInput(this.project.filesToScan);
    await this.scanner.scan(scanIn);
  }

  public cleanWorkDirectory() {
    this.scanner.cleanWorkDirectory();
  }
}
