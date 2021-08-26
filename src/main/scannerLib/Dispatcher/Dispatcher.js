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

// TO DO:
// - Add #CLIENT_TIMESTAMP to the fetch header

export class Dispatcher extends EventEmitter {
  // Client Timestamp
  #CLIENT_TIMESTAMP = 'scanner.c/1.0.0';

  // API URL
  // #API_URL = 'https://osskb.org/api/scan/direct';
  #API_URL = 'http://51.255.68.110:8886/api/scan/direct';

  // Level of concurrency
  #CONCURRENCY_LIMIT = 15;

  // Timeout for each transaction
  #TIMEOUT = 60000;

  // Max number of retries for each transaction
  #RETRIES = 3;

  // Promises queue
  #pQueue;

  #status;

  #error;

  #wfpFailed;

  constructor() {
    super();
    this.init();
  }

  init() {
    this.#pQueue = new PQueue({
      concurrency: this.#CONCURRENCY_LIMIT,
      timeout: this.#TIMEOUT,
      throwOnTimeout: true,
    });

    this.#pQueue.clear();

    this.#pQueue.on('idle', () => {
      this.emit(ScannerEvents.DISPATCHER_FINISHED);
    });

    this.#status = DispatcherEvents.STATUS_RUNNING;

    this.#wfpFailed = {};

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

  pause() {
    this.#pQueue.pause();
  }

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
    if (this.#status !== DispatcherEvents.STATUS_ERROR) {
      // Ensures to handle only the first error received (There are many promises running at any time)
      this.#status = DispatcherEvents.STATUS_ERROR;
      this.#error = error;
      this.pause();

      // Once all the promises are resolved or rejected emit the error event.
      const nextHandler = () => {
        if (this.#pQueue.pending === 0) {
          this.#pQueue.removeListener(nextHandler);
          this.emit('error', this.#error);

        }
      };

      this.#pQueue.on('next', nextHandler);
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
        const msg = await response.text();
        const err = new Error(msg);
        err.code = response.status;
        err.name = ScannerEvents.ERROR_SERVER_SIDE;
        throw err;
      }

      dataAsText = await response.text();
      dataAsObj = JSON.parse(dataAsText);
      this.emit(ScannerEvents.DISPATCHER_NEW_DATA, new DispatcherResponse(dataAsObj, wfpFilePath));
      return await Promise.resolve();
    } catch (error) {
      this.#setWfpAsFailed(wfpFilePath);
      if (error.name !== ScannerEvents.ERROR_SERVER_SIDE) error.name = ScannerEvents.ERROR_CLIENT_SIDE;
      console.log(error);
      throw error;
    }
  }
}
