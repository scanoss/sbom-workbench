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

// TO DO:
// - Split ScannerEvents into ExternalEvents and InternalEvents
// -

export class Scanner extends EventEmitter {

  #workDirectory;

  #scannerId;

  #scannable;

  #winnower;

  #dispatcher;

  #tempPath;

  #resultFilePath;

  #wfpFilePath;

  constructor() {
    super();
    this.initialize();
  }

  initialize() {
    this.#scannerId = new Date().getTime();

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

    this.#dispatcher.on(ScannerEvents.DISPATCHER_NEW_DATA, async (dispatcherResponse) => {
      await this.#persistOutputFiles(dispatcherResponse.getWfpContent(), dispatcherResponse.getServerResponse());
      await fs.promises.unlink(dispatcherResponse.getWfpFilePath());
      this.emit(ScannerEvents.DISPATCHER_NEW_DATA, dispatcherResponse.getServerResponse(), dispatcherResponse);
    });

    this.#dispatcher.on(ScannerEvents.DISPATCHER_FINISHED, () => {
      if (!this.#winnower.isRunning()) {
        this.#finishScan();
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

  #finishScan() {
    if (fs.existsSync(this.#tempPath)) fs.rmdirSync(this.#tempPath, { recursive: true });
    this.emit(ScannerEvents.SCAN_DONE, this.#resultFilePath);
  }

  #errorHandler(error, origin) {
    if (origin === ScannerEvents.MODULE_DISPATCHER) {
      // If this line is reached, dispatcher is already paused and no promises pending
      this.#winnower.pause();
      this.emit('error', error);
    }

    if (origin === ScannerEvents.MODULE_WINNOWER) {
      console.log(error);
      this.emit('error', error);
    }
  }

  #createOutputFiles() {
    if (!fs.existsSync(this.#wfpFilePath)) fs.writeFileSync(this.#wfpFilePath, '');
    if (!fs.existsSync(this.#resultFilePath)) fs.writeFileSync(this.#resultFilePath, JSON.stringify({}));
  }

  #persistOutputFiles(wfpContent, serverResponse) {
    fs.appendFileSync(this.#wfpFilePath, wfpContent);

    const storedResultStr = fs.readFileSync(this.#resultFilePath);
    const storedResultObj = JSON.parse(storedResultStr);
    Object.assign(storedResultObj, serverResponse);
    const newResultStr = JSON.stringify(storedResultObj, null, 4);
    fs.writeFileSync(this.#resultFilePath, newResultStr);

  }

  async scanList(fileList, scanRoot = '') {
    // Ensures to create a unique folder for each scanner instance in case no workDirectory was specified.
    if (this.#workDirectory === undefined) {
      await this.setWorkDirectory(`${os.tmpdir()}/scanner-${this.getScannerId()}`);
    }

    this.#createOutputFiles();

    if (!fileList.length) {
      this.#finishScan();
      return;
    }

    // await fs.promises.appendFile(dst, content);

    await this.#winnower.init();
    await this.#dispatcher.init();

    await this.#winnower.startWinnowing(fileList, scanRoot, this.#tempPath);

  }


  getScannerId() {
    return this.#scannerId;
  }

  pause() {
    this.#winnower.pause();
    this.#dispatcher.pause();
  }

  resume() {
    this.#winnower.resume();
    this.#dispatcher.resume();
  }

}
