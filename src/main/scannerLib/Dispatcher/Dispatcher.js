/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import EventEmitter from 'events';
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import PQueue from 'p-queue';
import { ScannerEvents } from '../ScannerEvents';
import { DispatcherResponse } from './DispatcherResponse';
import { DispatcherEvents } from './DispatcherEvents';
import { ScannerCfg } from '../ScannerCfg';

export class Dispatcher extends EventEmitter {
  #scannerCfg;

  #pQueue;

  #status;

  #error;

  #wfpFailed;

  #continue;

  constructor(scannerCfg = new ScannerCfg()) {
    super();
    this.#scannerCfg = scannerCfg;
    this.#init();
  }

  #init() {
    this.#pQueue = new PQueue({
      concurrency: this.#scannerCfg.CONCURRENCY_LIMIT,
      timeout: this.#scannerCfg.TIMEOUT,
      throwOnTimeout: true,
    });

    this.#pQueue.clear();

    this.#pQueue.on('idle', () => {
      this.emit(ScannerEvents.DISPATCHER_FINISHED);
    });

    this.#status = DispatcherEvents.STATUS_RUNNING;

    this.#continue = true;

    this.#wfpFailed = {};

  }

  stop() {
    this.#pQueue.removeAllListeners();
    this.#pQueue.clear();
    this.#pQueue.pause();

    // this.#pQueue.on('idle', () => {
    //   return new Promise((resolve) => {
    //     this.init();
    //     resolve();
    //   });
    // });
  }

  pause() {
    this.#pQueue.pause();
  }

  isDone(){}

  resume() {
    this.#status = DispatcherEvents.STATUS_RUNNING;
    this.#pQueue.removeListener('next');
    for (const wfpPathFailed in this.#wfpFailed) this.dispatchWfpFile(wfpPathFailed);
    this.#pQueue.start();
  }

  #setWfpAsFailed(wfpPath) {
    if (this.#wfpFailed.hasOwnProperty(wfpPath)) this.#wfpFailed[wfpPath] += 1;
    else this.#wfpFailed[wfpPath] = 1;
  }

  dispatchWfpFile(wfpPath) {
    this.#pQueue
      .add(() => this.#dispatch(wfpPath))
      .catch((error) => {
        this.#errorHandler(error);
      });
  }

  #errorHandler(error) {
    this.emit('error', error);
  }

  async #dispatch(wfpFilePath) {
    try {
      let dataAsText = '';
      let dataAsObj = {};
      const wfpContent = fs.readFileSync(wfpFilePath);
      const form = new FormData();
      form.append('filename', Buffer.from(wfpContent), 'data.wfp');

      // Fetch
      const p1 = fetch(this.#scannerCfg.API_URL, {
        method: 'post',
        body: form,
        headers: { 'User-Agent': this.#scannerCfg.CLIENT_TIMESTAMP },
      });

      this.emit(ScannerEvents.DISPATCHER_WFP_SENDED, wfpFilePath);
      const response = await p1;
      if (!response.ok) {
        const msg = await response.text();
        const err = new Error(msg);
        err.code = response.status;
        err.name = ScannerEvents.ERROR_SERVER_SIDE;
        throw err;
      }

      dataAsText = await response.text();
      dataAsObj = JSON.parse(dataAsText);
      const dispatcherResponse = new DispatcherResponse(dataAsObj, wfpFilePath);
      this.emit(ScannerEvents.DISPATCHER_NEW_DATA, dispatcherResponse);
      return await Promise.resolve();
    } catch (error) {
      this.#setWfpAsFailed(wfpFilePath);
      if (error.name !== ScannerEvents.ERROR_SERVER_SIDE) error.name = ScannerEvents.ERROR_CLIENT_SIDE;
      error.wfpFailedPath = wfpFilePath;
      throw error;
    }
  }
}
