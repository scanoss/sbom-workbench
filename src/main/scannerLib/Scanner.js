// 2.0
import EventEmitter from 'events';
import os from 'os';
import fs from 'fs';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AbstractScannable } from './Scannable/AbstractScannable';
import { ScannableTree } from './Scannable/ScannableTree';
import { ScannableFolder } from './Scannable/ScannableFolder';
import { ScannableJson } from './Scannable/ScanneableJson';
import { Winnower } from './Winnower/Winnower';
import { Dispatcher } from './Dispatcher/Dispatcher';
import { DispatcherEvents } from './Dispatcher/DispatcherEvents';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { DispatcherResponse } from './Dispatcher/DispatcherResponse';
import { ScannerEvents } from './ScannerEvents';

// TO DO:
// - Split ScannerEvents into ExternalEvents and InternalEvents
// -

export class Scanner extends EventEmitter {
  // Private properties
  #scannable;

  #winnower;

  #dispatcher;

  #wfpDestPath = `${os.tmpdir()}/ScanossDesktopApp`;

  #resultFilePath = `${this.#wfpDestPath}/result.json`;

  #tmpResult;

  #aborted;

  constructor() {
    super();
    this.initialize();
  }

  initialize() {
    this.#winnower = new Winnower();
    /* ******************* SETTING WINNOWING EVENTS ******************* */
    this.#winnower.on(ScannerEvents.WINNOWING_STARTING, () => {
      this.emit(ScannerEvents.WINNOWING_STARTING);
    });

    this.#winnower.on(ScannerEvents.WINNOWING_NEW_WFP_FILE, (wfpPath) => {
      this.emit(ScannerEvents.WINNOWING_NEW_WFP_FILE, wfpPath);
      this.#dispatcher.dispatchWfpFile(wfpPath);
    });
    this.#winnower.on(ScannerEvents.WINNOWING_FINISHED, () => {
      this.emit(ScannerEvents.WINNOWING_FINISHED);
    });

    this.#winnower.on('error', (error) => {
      this.#errorHandler(error, 'WINNOWER');
    });
    /* ******************* SETTING WINNOWING EVENTS ******************* */

    this.#dispatcher = new Dispatcher();
    /* ******************* SETTING DISPATCHER EVENTS ******************** */
    this.#dispatcher.on(ScannerEvents.DISPATCHER_WFP_SENDED, (wfpPath) => {
      this.emit(ScannerEvents.DISPATCHER_WFP_SENDED, wfpPath);
    });

    this.#dispatcher.on(ScannerEvents.DISPATCHER_NEW_DATA, (dispatcherResponse) => {
      const serverResponse = dispatcherResponse.getServerData();
      const serverResposeNumFiles = dispatcherResponse.getNumberOfFiles();
      Object.assign(this.#tmpResult, serverResponse);
      this.emit(ScannerEvents.DISPATCHER_NEW_DATA, serverResponse, serverResposeNumFiles);
    });

    this.#dispatcher.on(ScannerEvents.DISPATCHER_FINISHED, () => {
      if (!this.#winnower.isRunning()) {
        const str = JSON.stringify(this.#tmpResult, null, 4);
        fs.writeFileSync(this.#resultFilePath, str);
        this.emit(ScannerEvents.SCAN_DONE, this.#resultFilePath);
      }
    });

    this.#dispatcher.on('error', (error) => {
      this.#errorHandler(error, 'DISPATCHER');
    });
    /* ******************* SETTING DISPATCHER EVENTS ******************** */

    this.#tmpResult = {};
    this.#aborted = false;
  }

  #errorHandler(error, origin) {
    if (origin === 'DISPATCHER') {
      if (error.message === DispatcherEvents.ERROR_NETWORK_CONNECTIVITY) {
        this.#aborted = true;
        this.#winnower.pause(); //Only pause winnowing. Dispatcher is already paused
        this.emit('error', new Error(ScannerEvents.ERROR_SCANNER_ABORTED));
      }
      return;
    }

    if (origin === 'WINNOWER') {
      console.log(error);
    }
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

  async scanJsonList(jsonList) {
    this.#scannable = new ScannableJson(jsonList);
    await this.#scan();
  }

  async scanFolder(dirPath) {
    this.#scannable = new ScannableFolder(dirPath);
    await this.#scan();
  }

  pause() {
    this.#winnower.pause();
    this.#dispatcher.pause();
    this.#tmpResult = {};
  }

  resume() {}

  restart() {}

  isAbort() {
    return this.#aborted;
  }
}
