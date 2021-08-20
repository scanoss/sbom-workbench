/* eslint-disable no-console */
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
  #DEFAULT_WORK_DIRECTORY = `${os.tmpdir()}/ScanossDesktopApp`;

  #scannerId;

  #scannable;

  #winnower;

  #dispatcher;

  #tempPath = `${os.tmpdir()}/ScanossDesktopApp`;

  #resultFilePath = `${this.#tempPath}/result.json`;

  #wfpFilePath = `${this.#tempPath}/winnowing.wfp`;

  #tmpResult;

  #aborted; // Not used

  #scannedFiles;

  #TempWorkPath;

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
      this.#errorHandler(error, ScannerEvents.MODULE_WINNOWER);
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
      this.#scannedFiles += serverResposeNumFiles;
      Object.assign(this.#tmpResult, serverResponse);
      this.emit(ScannerEvents.DISPATCHER_NEW_DATA, serverResponse, serverResposeNumFiles);
    });

    this.#dispatcher.on(ScannerEvents.DISPATCHER_FINISHED, () => {
      if (!this.#winnower.isRunning()) {
        this.#storeResult();
      }
    });

    this.#dispatcher.on('error', (error) => {
      this.#errorHandler(error, ScannerEvents.MODULE_DISPATCHER);
    });
    /* ******************* SETTING DISPATCHER EVENTS ******************** */

    this.setTempWorkPath();

    this.#tmpResult = {};
    this.#scannedFiles = 0;
    this.#aborted = false;

    this.#scannerId = new Date().getTime();
  }

  #storeResult() {
    const str = JSON.stringify(this.#tmpResult, null, 4);
    fs.writeFileSync(this.#resultFilePath, str);
    this.emit(ScannerEvents.SCAN_DONE, this.#resultFilePath);
    console.log(`Scanned ${this.#scannedFiles} files`);
  }

  #errorHandler(error, origin) {
    if (origin === ScannerEvents.MODULE_DISPATCHER) {
      //If this line is reached, dispatcher is paused and no promises pending

      if (error.name === ScannerEvents.ERROR_SERVER_SIDE) {
        console.log('Error en el lado del server');
      }

      this.#winnower.pause().then(()=>{
        this.emit('error', error);
      });

    }

    if (origin === ScannerEvents.MODULE_WINNOWER) {
      console.log(error);
    }
  }

  async #scan() {
    const totalFiles = await this.#scannable.prepare();

    if (totalFiles === 0) {
      this.#storeResult();
      return;
    }

    await this.#winnower.init();
    await this.#dispatcher.init();
    await this.#winnower.startMachine(this.#scannable, this.#tempPath, this.#wfpFilePath);
  }

  setResultsPath(path) {
    this.#resultFilePath = `${path}/results.json`;
  }

  setWinnowingPath(path) {
    this.#wfpFilePath = `${path}/winnowing.wfp`;
  }

  setTempWorkPath(path) {
    this.#TempWorkPath =  path;
  }

  getScannerId(){ return this.#scannerId; }

  getWinnowingPath(path) {
    return this.#wfpFilePath;
  }

  // Public Methods
  async scanFileTree(fileTreeDescriptor) {
    this.#scannable = new ScannableTree(fileTreeDescriptor);
    await this.#scan();
  }

  async scanJsonList(jsonList, scanRoot) {
    this.#scannable = new ScannableJson(jsonList);
    this.#scannable.setScanRoot(scanRoot);
    await this.#scan();
  }

  async scanFolder(dirPath) {
    this.#scannable = new ScannableFolder(dirPath);
    await this.#scan();
  }

  pause() {
    this.#winnower.pause();
    this.#dispatcher.pause();
  }

  resume() {
    this.#winnower.resume();
    this.#dispatcher.resume();
  }

  restart() {}

  isAbort() {
    return this.#aborted;
  }
}
