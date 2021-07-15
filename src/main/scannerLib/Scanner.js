// 2.0
import EventEmitter from 'events';
import os from 'os';
import fs from 'fs';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AbstractScannable } from './Scannable/AbstractScannable';
import { ScannableTree } from './Scannable/ScannableTree';
import { ScannableFolder } from './Scannable/ScannableFolder';
import { Winnower } from './Winnower/Winnower';
import { Dispatcher } from './Dispatcher/Dispatcher';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { DispatcherResponse } from './Dispatcher/DispatcherResponse';
import { SCANNER_EVENTS } from './ScannerEvents';

export class Scanner extends EventEmitter {
  // Private properties
  #scannable;

  #winnower;

  #dispatcher;

  #wfpDestPath = `${os.tmpdir()}/ScanossDesktopApp`;

  #resultFilePath = `${this.#wfpDestPath}/result.json`;

  #tmpResult;

  constructor() {
    super();

    this.#winnower = new Winnower();
    this.#dispatcher = new Dispatcher();
    this.#tmpResult = {};

    /* SETTING WINNOWING EVENTS */
    this.#winnower.on(SCANNER_EVENTS.WINNOWING_STARTING, () => {
      this.emit(SCANNER_EVENTS.WINNOWING_STARTING);
    });

    this.#winnower.on(SCANNER_EVENTS.WINNOWING_NEW_WFP_FILE, (wfpPath) => {
      this.emit(SCANNER_EVENTS.WINNOWING_NEW_WFP_FILE, wfpPath);
      this.#dispatcher.dispatchWfpFile(wfpPath);
    });
    this.#winnower.on(SCANNER_EVENTS.WINNOWING_FINISHED, () => {
      this.emit(SCANNER_EVENTS.WINNOWING_FINISHED);
    });
    /* SETTING WINNOWING EVENTS */

    /* SETTING DISPATCHER EVENTS */
    this.#dispatcher.on(SCANNER_EVENTS.DISPATCHER_WFP_SENDED, (wfpPath) => {
      this.emit(SCANNER_EVENTS.DISPATCHER_WFP_SENDED, wfpPath);
    });

    this.#dispatcher.on('error', (error) => {
      this.emit('error', error);
    });

    this.#dispatcher.on(
      SCANNER_EVENTS.DISPATCHER_NEW_DATA,
      (dispatcherResponse) => {
        const serverResponse = dispatcherResponse.getServerData();
        const serverResposeNumFiles = dispatcherResponse.getNumberOfFiles();
        Object.assign(this.#tmpResult, serverResponse);
        this.emit(
          SCANNER_EVENTS.DISPATCHER_NEW_DATA,
          serverResponse,
          serverResposeNumFiles
        );
      }
    );

    this.#dispatcher.on(SCANNER_EVENTS.DISPATCHER_FINISHED, () => {
      if (!this.#winnower.isRunning()) {
        const str = JSON.stringify(this.#tmpResult, null, 4);
        fs.writeFileSync(this.#resultFilePath, str);
        this.emit(SCANNER_EVENTS.SCAN_DONE, this.#resultFilePath);
      }
    });
    /* SETTING DISPATCHER EVENTS */
  }

  async #scan() {
    await this.#scannable.prepare();
    await this.#winnower.init();
    await this.#dispatcher.init();
    await this.#winnower.startMachine(this.#scannable, this.#wfpDestPath);
  }

  setResultsPath(path) {
    this.#resultFilePath = `${path}/results.json`;
  }

  // Public Methods
  async scanFileTree(fileTreeDescriptor) {
    this.#scannable = new ScannableTree(fileTreeDescriptor);
    await this.#scan();
  }

  async scanFolder(dirPath) {
    this.#scannable = new ScannableFolder(dirPath);
    await this.#scan();
  }

  stop() {
    this.#winnower.stop();
    this.#dispatcher.stop();
    this.#tmpResult = {};
  }
}
