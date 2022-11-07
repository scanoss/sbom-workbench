import {ScannerEvents, ScannerInput} from "scanoss";
import log from "electron-log";
import {IpcChannels} from "../../../api/ipc-channels";
import { ScanTask } from "./ScanTask";

export class WFPScanTask extends ScanTask{

  // @Override
  public async init(): Promise<void> {
      this.setScannerConfig();
      this.cleanWorkDirectory();
      this.scanner.on(ScannerEvents.DISPATCHER_NEW_DATA, async (response) => {
        this.project.processedFiles += response.getNumberOfFilesScanned();
        const filesScanned = response.getFilesScanned();
        // eslint-disable-next-lie no-restricted-syntax
        for (const file of filesScanned)
          delete this.project.filesToScan[`${file}`];
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

  // @Override
  public adapterToScannerInput(
    filesToScan: Record<string, string>
  ): Array<ScannerInput> {
  const scannerInput:Array<ScannerInput> =[{
    fileList: [],
    wfpPath:  this.project.getScanRoot(),
  }];
  return scannerInput;
  }
}
