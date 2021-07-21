import EventEmitter from 'events';
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import PQueue from 'p-queue';
import { ScannerEvents } from '../ScannerEvents';
import { DispatcherResponse } from './DispatcherResponse';
import { DispatcherEvents } from './DispatcherEvents';

// TO DO:
// - Add #CLIENT_TIMESTAMP to the fetch header

export class Dispatcher extends EventEmitter {
  // Client Timestamp
  #CLIENT_TIMESTAMP = 'scanner.c/1.0.0';

  // API URL
  #API_URL = 'https://osskb.org/api/scan/direct';

  // Level of concurrency
  #CONCURRENCY_LIMIT = 6;

  // Timeout for each transaction
  #TIMEOUT = 15000;

  // Max number of retries for each transaction
  #RETRIES = 3;

  // Promises queue
  #pQueue;

  // Error counter (Resets every time a transaction is complete)
  #networkErrorCounter;

  constructor() {
    super();
    this.init();
  }

  init() {

    this.#networkErrorCounter = 0;

    this.#pQueue = new PQueue({
      concurrency: this.#CONCURRENCY_LIMIT,
      timeout: this.#TIMEOUT,
      throwOnTimeout: true,
    });

    this.#pQueue.clear();
    if (this.#pQueue.isPaused) this.#pQueue.start();

    this.#pQueue.on('idle', () => {
      this.emit(ScannerEvents.DISPATCHER_FINISHED)
    });

    // Only works for pQueue@7.x.x versions
    // this.#pQueue.on('error', (error) => {
    //   console.log("ERROR CATCHED....");
    //   this.#errorHandler(error);
    // });
  }

  setApiUrl(url) {
    this.#API_URL = url;
  }

  stop() {
    this.#pQueue.removeListener('idle');
    this.#pQueue.clear();
    this.#pQueue.pause();
  }

  isPaused() {
    return this.#pQueue.isPaused;
  }

  pause() {
    this.#pQueue.pause();
  }

  resume() {
    this.#pQueue.start();
  }

  dispatchWfpFile(wfpPath) {
    this.#pQueue
      .add(() => this.#dispatch(wfpPath))
      .catch((error) => {
        this.#errorHandler(error);
      });
  }

  #errorHandler(error) {
    if (
      error.message === DispatcherEvents.ERROR_NETWORK_CONNECTIVITY ||
      error.name === DispatcherEvents.ERROR_TRANSACTION_TIMEOUT
    ) {
      if (this.isPaused()) this.pause();

      // Wait until all promises are resolved or rejected. Could be timeout or Network error
      if (this.#pQueue.pending <= 0) {
        this.emit('error', new Error(DispatcherEvents.ERROR_NETWORK_CONNECTIVITY));
      }
    }
  }

  async #dispatch(wfpFilePath) {
    try {
      let dataAsText = '';
      let dataAsObj = {};
      const wfpContent = fs.readFileSync(wfpFilePath);
      const form = new FormData();
      form.append('filename', Buffer.from(wfpContent), 'data.wfp');

      this.emit(ScannerEvents.DISPATCHER_WFP_SENDED, wfpFilePath);

      // Fetch
      const p1 = fetch(this.#API_URL, {
        method: 'post',
        body: form,
      });

      const response = await p1;
      if (!response.ok) {
        throw new Error('Server communication failed');
      }

      dataAsText = await response.text();
      dataAsObj = JSON.parse(dataAsText);
      this.emit(ScannerEvents.DISPATCHER_NEW_DATA, new DispatcherResponse(dataAsObj, wfpFilePath));
      return await Promise.resolve();
    } catch (error) {
      if (error.code === 'EAI_AGAIN') {
        throw new Error(DispatcherEvents.ERROR_NETWORK_CONNECTIVITY);
      }
      throw new Error(error);
    }
  }
}
