/* eslint-disable no-console */
// 2.0
import EventEmitter from 'events';
import os from 'os';
import fs, { unlink, unlinkSync } from 'fs';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Winnower } from './Winnower/Winnower';
import { Dispatcher } from './Dispatcher/Dispatcher';
import { DispatcherEvents } from './Dispatcher/DispatcherEvents';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { DispatcherResponse } from './Dispatcher/DispatcherResponse';
import { ScannerEvents } from './ScannerEvents';
import { ScannerCfg } from './ScannerCfg';

const sortPaths = require ('sort-paths');


// TO DO:
// - Split ScannerEvents into ExternalEvents and InternalEvents
// - Implement a static atribute to keep track of the scannerId

export class Scanner extends EventEmitter {

  #scannerCfg;

  #workDirectory;

  #scanRoot

  #scannerId;

  #winnower;

  #dispatcher;

  #tempPath;

  #resultFilePath;

  #wfpFilePath;

  #scanFinished; // Both flags are used to prevent a race condition between DISPATCHER.NEW_DATA and DISPATCHER_FINISHED

  #processingNewData; // Both flags are used to prevent a race condition between DISPATCHER.NEW_DATA and DISPATCHER_FINISHED

  constructor(scannerCfg = new ScannerCfg()) {
    super();
    this.#scannerCfg = scannerCfg;
    this.#scannerId = new Date().getTime();
    this.#init();
  }

  #init() {
    this.#scanFinished = false;
    this.#processingNewData = false;

    this.#winnower = new Winnower(this.#scannerCfg);
    this.#dispatcher = new Dispatcher(this.#scannerCfg);

    this.#setWinnowerListeners();
    this.#setDispatcherListeners();
  }

  #setWinnowerListeners(){
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
  }

  #setDispatcherListeners() {
    /* ******************* SETTING DISPATCHER EVENTS ******************** */
    this.#dispatcher.on(ScannerEvents.DISPATCHER_WFP_SENDED, (wfpPath) => {
      this.emit(ScannerEvents.DISPATCHER_WFP_SENDED, wfpPath);
    });

    this.#dispatcher.on(ScannerEvents.DISPATCHER_NEW_DATA, async (dispatcherResponse) => {
      this.processingNewData = true;
      await this.#appendOutputFiles(dispatcherResponse.getWfpContent(), dispatcherResponse.getServerResponse());
      await fs.promises.unlink(dispatcherResponse.getWfpFilePath());
      this.emit(ScannerEvents.DISPATCHER_NEW_DATA, dispatcherResponse.getServerResponse(), dispatcherResponse);
      this.#processingNewData = false;

      if (this.#scanFinished) this.#finishScan();
    });

    this.#dispatcher.on(ScannerEvents.DISPATCHER_FINISHED, () => {
      if (!this.#winnower.isRunning()) {
        if (this.#processingNewData) this.#scanFinished = true;
        else this.#finishScan();
      }
    });

    this.#dispatcher.on('error', (error) => {
      this.#errorHandler(error, ScannerEvents.MODULE_DISPATCHER);
    });
    /* ******************* SETTING DISPATCHER EVENTS ******************** */
  }

  setWorkDirectory(path) {
    this.#workDirectory = path;
    this.#tempPath = `${this.#workDirectory}/scanner-tmp`;
    this.#resultFilePath = `${this.#workDirectory}/result.json`;
    this.#wfpFilePath = `${this.#workDirectory}/winnowing.wfp`;

    if (!fs.existsSync(this.#workDirectory)) fs.mkdirSync(this.#workDirectory);
    if (!fs.existsSync(this.#tempPath)) fs.mkdirSync(this.#tempPath);
  }

  cleanWorkDirectory() {
    if (fs.existsSync(this.#tempPath)) fs.rmdirSync(this.#tempPath, { recursive: true });
    if (fs.existsSync(this.#resultFilePath)) fs.unlinkSync(this.#resultFilePath);
    if (fs.existsSync(this.#wfpFilePath)) fs.unlinkSync(this.#wfpFilePath);
  }

  cleanTmpDirectory() {
    if (fs.existsSync(this.#tempPath)) fs.rmdirSync(this.#tempPath, { recursive: true });
    if (!fs.existsSync(this.#tempPath)) fs.mkdirSync(this.#tempPath);
  }

  #finishScan() {
    const results = JSON.parse(fs.readFileSync(this.#resultFilePath, 'utf8'));
    const sortedPaths = sortPaths(Object.keys(results), '/');
    const resultSorted = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const key of sortedPaths) resultSorted[key] = results[key];
    fs.writeFileSync(this.#resultFilePath, JSON.stringify(resultSorted, null,4));
    this.emit(ScannerEvents.SCAN_DONE, this.#resultFilePath);
  }

  #errorHandler(error, origin) {
    console.log(error);
    this.stop();
    this.emit('error', error);

    if (origin === ScannerEvents.MODULE_DISPATCHER) {
      if (error.wfpFailedPath) fs.copyFileSync(error.wfpFailedPath, `${this.#tempPath}/failed.wfp`);
    }
    if (origin === ScannerEvents.MODULE_WINNOWER) {}
  }

  #createOutputFiles() {
    if (!fs.existsSync(this.#wfpFilePath)) fs.writeFileSync(this.#wfpFilePath, '');
    if (!fs.existsSync(this.#resultFilePath)) fs.writeFileSync(this.#resultFilePath, JSON.stringify({}));
  }

  #appendOutputFiles(wfpContent, serverResponse) {
    fs.appendFileSync(this.#wfpFilePath, wfpContent);
    const storedResultStr = fs.readFileSync(this.#resultFilePath);
    const storedResultObj = JSON.parse(storedResultStr);
    Object.assign(storedResultObj, serverResponse);
    const newResultStr = JSON.stringify(storedResultObj, null, 4);
    fs.writeFileSync(this.#resultFilePath, newResultStr);
  }

  async scanList(files, scanRoot = '') {
    this.#init();

    this.#scanRoot = scanRoot;
    // Ensures to create a unique folder for each scanner instance in case of workDirectory was not specified.
    if (this.#workDirectory === undefined) {
      await this.setWorkDirectory(`${os.tmpdir()}/scanner-${this.getScannerId()}`);
    }

    this.#createOutputFiles();

    if (!Object.entries(files).length) {
      this.#finishScan();
      return;
    }


    this.#winnower.startWinnowing(files, scanRoot, this.#tempPath);
  }


  getScannerId() {
    return this.#scannerId;
  }

  pause() {
    this.#winnower.pause();
    this.#dispatcher.pause();

    // return new Promise((resolve,reject) => {
    //   this.#winnower.pause();
    //   this.#dispatcher.pause();
    //   this.#dispatcher.on(ScannerEvents.DISPATCHER_FINISHED, () => {
    //     if (!this.#winnower.isRunning()) resolve();
    //   })
    // });
  }


  resume() {
    this.#winnower.resume();
    this.#dispatcher.resume();
  }

  stop() {
    this.#winnower.removeAllListeners();
    this.#dispatcher.removeAllListeners();

    this.#winnower.stop();
    this.#dispatcher.stop();
  }

}
