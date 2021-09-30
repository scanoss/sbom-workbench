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
import { VerticalAlignCenterSharp } from '@material-ui/icons';
import { Resolver } from 'dns';

export class Dispatcher extends EventEmitter {
  #scannerCfg;

  #pQueue;

  #status;

  #error;

  #wfpFailed;

  #continue;

  #queueMaxLimitReached;

  #queueMinLimitReached;

  #recoverableErrors;

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
    this.#pQueue.on('next', () => {
      if ((this.#pQueue.size + this.#pQueue.pending) < this.#scannerCfg.DISPATCHER_QUEUE_SIZE_MIN_LIMIT && !this.#queueMinLimitReached) {
        this.emit(ScannerEvents.DISPATCHER_QUEUE_SIZE_MIN_LIMIT);
        this.#queueMinLimitReached = true;
        this.#queueMaxLimitReached = false;
      }
    });
    this.#continue = true;
    this.#wfpFailed = [];
    this.#queueMaxLimitReached = false;
    this.#queueMinLimitReached = true;

    this.#recoverableErrors = new Set();
    this.#recoverableErrors.add('ECONNRESET');
    this.#recoverableErrors.add('TIMEOUT');
  }

  stop() {
    this.#pQueue.removeAllListeners();
    this.#pQueue.clear();
    this.#pQueue.pause();
  }

  pause() {
    this.#pQueue.pause();
  }

  resume() {
    for (const wfpPathFailed in this.#wfpFailed) this.dispatchWfpFile(wfpPathFailed);
    this.#pQueue.start();
  }

  dispatchItem(disptItem) {
    this.#pQueue.add(() => this.#dispatch(disptItem)).catch((error) => {
        this.#errorHandler(error, disptItem);
      });

    if ( (this.#pQueue.size + this.#pQueue.pending) >= this.#scannerCfg.DISPATCHER_QUEUE_SIZE_MAX_LIMIT && !this.#queueMaxLimitReached) {
      this.emit(ScannerEvents.DISPATCHER_QUEUE_SIZE_MAX_LIMIT);
      this.#queueMaxLimitReached = true;
      this.#queueMinLimitReached = false;
    }
  }

  #resolvePromisesAndEmitError(error) {
    if (!this.#pQueue.pending) {
      this.emit('error', error);
      this.#pQueue.removeAllListeners();
      return;
    }
    this.#pQueue.pause();
    this.#pQueue.on('next', () => {
      console.log(`PROMESAS PENDIENTES: ${this.#pQueue.pending}`);
      if (this.#pQueue.pending === 0) {
        this.emit('error', error);
      }
    });

  }

  #errorHandler(error, disptItem) {
    if (error.name === 'TimeoutError') {
      // eslint-disable-next-line no-param-reassign
      error = new Error('TIMEOUT');
      error.code = 'TIMEOUT';
    }

    if (this.#recoverableErrors.has(error.code)) {
      console.log(`[ SCANNER ]: Recoverable error happened sending WFP. Reason: ${error.code}`);
      disptItem.increaseErrorCounter();
      if (disptItem.getErrorCounter() >= 1) {

      }
      console.log("Agregando item de nuevo a la cola");
      this.#dispatch(disptItem);
      return;
    }

    this.stop();
    this.emit('error', error);
  }

  async #dispatch(disptItem) {
    let dataAsText = '';
    let dataAsObj = {};
    const form = new FormData();
    form.append('filename', disptItem.getContent(), 'data.wfp');

    // Fetch
    const p1 = fetch(this.#scannerCfg.API_URL, {
      method: 'post',
      body: form,
      headers: { 'User-Agent': this.#scannerCfg.CLIENT_TIMESTAMP },
    });

    this.emit(ScannerEvents.DISPATCHER_WFP_SENDED);
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
    const dispatcherResponse = new DispatcherResponse(dataAsObj, disptItem.getContent());
    this.emit(ScannerEvents.DISPATCHER_NEW_DATA, dispatcherResponse);
    return Promise.resolve();
  }
}
