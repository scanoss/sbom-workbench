/* eslint-disable no-console */
// 2.0
import EventEmitter from 'events';
import os from 'os';
import fs, { unlink, unlinkSync } from 'fs';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import path from 'path';
import { Winnower } from './Winnower/Winnower';
import { Dispatcher } from './Dispatcher/Dispatcher';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { DispatcherResponse } from './Dispatcher/DispatcherResponse';
import { ScannerEvents } from './ScannerEvents';
import { ScannerCfg } from './ScannerCfg';
import { DispatchableItem } from './Dispatcher/DispatchableItem';

const sortPaths = require('sort-paths');

// TO DO:
// - Split ScannerEvents into ExternalEvents and InternalEvents
// - Implement a static atribute to keep track of the scannerId

export class Scanner extends EventEmitter {
  #scannerCfg;

  #workDirectory;

  #scanRoot;

  #scannerId;

  #winnower;

  #dispatcher;

  #resultFilePath;

  #wfpFilePath;

  #scanFinished; // Both flags are used to prevent a race condition between DISPATCHER.NEW_DATA and DISPATCHER_FINISHED

  #processingNewData; // Both flags are used to prevent a race condition between DISPATCHER.NEW_DATA and DISPATCHER_FINISHED

  #responseBuffer;

  #processedFiles;

  #isRunning;

  filesToScan;

  filesNotScanned;

  constructor(scannerCfg = new ScannerCfg()) {
    super();
    this.#scannerCfg = scannerCfg;
    this.#scannerId = new Date().getTime();
  }

  #init() {
    this.#scanFinished = false;
    this.#processingNewData = false;
    this.#isRunning = true;
    this.#processedFiles = 0;
    this.#responseBuffer = [];
    this.filesToScan = {};
    this.filesNotScanned = {};
    this.#winnower = new Winnower(this.#scannerCfg);
    this.#dispatcher = new Dispatcher(this.#scannerCfg);

    this.#setWinnowerListeners();
    this.#setDispatcherListeners();

    if (this.#workDirectory === undefined) this.setWorkDirectory(`${os.tmpdir()}/scanner-${this.getScannerId()}`);
  }

  #setWinnowerListeners() {
    this.#winnower.on(ScannerEvents.WINNOWING_NEW_CONTENT, (winnowerResponse) => {
      this.#reportLog(`[ SCANNER ]: New WFP content`);
      const disptItem = new DispatchableItem(winnowerResponse);
      this.#dispatcher.dispatchItem(disptItem);
    });

    this.#winnower.on(ScannerEvents.WINNOWER_LOG, (msg) => {
      this.#reportLog(msg);
    });

    this.#winnower.on('error', (error) => {
      this.#errorHandler(error, ScannerEvents.MODULE_WINNOWER);
    });
  }

  #setDispatcherListeners() {
    this.#dispatcher.on(ScannerEvents.DISPATCHER_QUEUE_SIZE_MAX_LIMIT, () => {
      this.#reportLog(`[ SCANNER ]: Maximum queue size reached. Winnower will be paused`);
      this.#winnower.pause();
    });

    this.#dispatcher.on(ScannerEvents.DISPATCHER_QUEUE_SIZE_MIN_LIMIT, () => {
      this.#reportLog(`[ SCANNER ]: Minimum queue size reached. Winnower will be resumed`);
      this.#winnower.resume();
    });

    this.#dispatcher.on(ScannerEvents.DISPATCHER_NEW_DATA, async (response) => {
      this.processingNewData = true;
      this.#processedFiles += response.getNumberOfFilesScanned();
      this.#reportLog(`[ SCANNER ]: Received results of ${response.getNumberOfFilesScanned()} files`);
      this.emit(ScannerEvents.DISPATCHER_NEW_DATA, response);
      this.#insertIntoBuffer(response);
      if (this.#bufferReachedLimit()) this.#bufferToFiles();
      this.#processingNewData = false;
      if (this.#scanFinished) await this.#finishScan();
    });

    this.#dispatcher.on(ScannerEvents.DISPATCHER_FINISHED, async () => {
      if (!this.#winnower.hasPendingFiles()) {
        if (this.#processingNewData) this.#scanFinished = true;
        else await this.#finishScan();
      }
    });

    this.#dispatcher.on(ScannerEvents.DISPATCHER_ITEM_NO_DISPATCHED, (disptItem) => {
      const filesNotScanned = disptItem.getWinnowerResponse().getFilesWinnowed();
      this.#appendFilesToNotScanned(filesNotScanned);
    });

    this.#winnower.on(ScannerEvents.DISPATCHER_LOG, (msg) => {
      this.#reportLog(msg);
    });

    this.#dispatcher.on('error', (error, disptItem) => {
      const wfpContent = disptItem.getWinnowerResponse().getContent();
      fs.writeFileSync(`${this.#workDirectory}/failed.wfp`, wfpContent, 'utf8');
      this.#errorHandler(error, ScannerEvents.MODULE_DISPATCHER);
    });
  }

  #appendFilesToNotScanned(fileList) {
    const obj = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const file of fileList) obj[file] = this.filesToScan[file];
    Object.assign(this.filesNotScanned, obj);
    return this.filesNotScanned;
  }

  #insertIntoBuffer(dispatcherResponse) {
    this.#responseBuffer.push(dispatcherResponse);
  }

  #isBufferEmpty() {
    return this.#responseBuffer.length === 0;
  }

  #bufferReachedLimit() {
    if (this.#responseBuffer.length >= this.#scannerCfg.MAX_RESPONSES_IN_BUFFER) return true;
    return false;
  }

  #bufferToFiles() {
    let wfpContent = '';
    const serverResponse = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const dispatcherResponse of this.#responseBuffer) {
      wfpContent += dispatcherResponse.getWfpContent();
      const serverResponseToAppend = dispatcherResponse.getServerResponse();
      Object.assign(serverResponse, serverResponseToAppend);
    }
    this.#appendOutputFiles(wfpContent, serverResponse);
    this.#responseBuffer = [];
    const responses = new DispatcherResponse(serverResponse, wfpContent);
    this.#reportLog(`[ SCANNER ]: Persisted results of ${responses.getNumberOfFilesScanned()} files...`);
    this.emit(ScannerEvents.RESULTS_APPENDED, responses, this.filesNotScanned);
    return responses;
  }

  setWorkDirectory(workDirectory) {
    this.#workDirectory = workDirectory;
    this.#resultFilePath = `${this.#workDirectory}/result.json`;
    this.#wfpFilePath = `${this.#workDirectory}/winnowing.wfp`;

    if (!fs.existsSync(this.#workDirectory)) fs.mkdirSync(this.#workDirectory);
  }

  cleanWorkDirectory() {
    if (fs.existsSync(this.#resultFilePath)) fs.unlinkSync(this.#resultFilePath);
    if (fs.existsSync(this.#wfpFilePath)) fs.unlinkSync(this.#wfpFilePath);
  }

  async #finishScan() {
    if (!this.#isBufferEmpty()) this.#bufferToFiles();
    const results = JSON.parse(await fs.promises.readFile(this.#resultFilePath, 'utf8'));
    const sortedPaths = sortPaths(Object.keys(results), '/');
    const resultSorted = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const key of sortedPaths) resultSorted[key] = results[key];
    await fs.promises.writeFile(this.#resultFilePath, JSON.stringify(resultSorted, null, 2));
    this.#reportLog(
      `[ SCANNER ]: Scan finished (Scanned: ${this.#processedFiles}, Not Scanned: ${
        Object.keys(this.filesNotScanned).length
      })`
    );
    this.#reportLog(`[ SCANNER ]: Results on: ${this.#resultFilePath}`);
    this.#isRunning = false;
    this.emit(ScannerEvents.SCAN_DONE, this.#resultFilePath, this.filesNotScanned);
  }

  #reportLog(txt, level = 'info') {
    this.emit(ScannerEvents.SCANNER_LOG, txt, level);
  }

  #errorHandler(error, origin) {
    this.stop();
    if (origin === ScannerEvents.MODULE_DISPATCHER) {
    }
    if (origin === ScannerEvents.MODULE_WINNOWER) {
    }

    this.#reportLog(`[ SCANNER ]: Error reason ${error}`);

    this.emit('error', error);
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
    const newResultStr = JSON.stringify(storedResultObj);
    fs.writeFileSync(this.#resultFilePath, newResultStr);
  }

  async scanList(files, scanRoot = '') {
    this.#init();

    this.filesToScan = files;
    this.#scanRoot = scanRoot;
    this.#createOutputFiles();

    if (!Object.entries(files).length) {
      await this.#finishScan();
      return;
    }

    this.#winnower.startWinnowing(this.filesToScan, scanRoot);
  }

  getScannerId() {
    return this.#scannerId;
  }

  pause() {
    this.#isRunning = false;
    this.#winnower.pause();
    this.#dispatcher.pause();
  }

  resume() {
    this.#isRunning = true;
    this.#winnower.resume();
    this.#dispatcher.resume();
  }

  stop() {
    this.#reportLog(`[ SCANNER ]: Stopping scanner`);
    this.#isRunning = false;
    this.#winnower.removeAllListeners();
    this.#dispatcher.removeAllListeners();
    this.#dispatcher.stop();
    this.#winnower.stop();
  }

  isRunning() {
    return this.#isRunning;
  }

}
