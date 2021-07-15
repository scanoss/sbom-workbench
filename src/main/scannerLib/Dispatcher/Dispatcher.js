import EventEmitter from 'events';
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import PQueue from 'p-queue';
import { SCANNER_EVENTS } from '../ScannerEvents';
import { DispatcherResponse } from './DispatcherResponse';

export class Dispatcher extends EventEmitter {
  // Client Timestamp
  #CLIENT_TIMESTAMP = 'scanner.c/1.0.0';

  // API URL
  #API_URL = 'https://osskb.org/api/scan/direct';

  // Level of concurrency
  #CONCURRENCY_LIMIT = 10;

  // Timeout for each transaction
  #TIMEOUT = 90000;

  // Max number of retries for each transaction
  #RETRIES = 3;

  #pQueue;

  constructor() {
    super();
    this.init();
  }

  init() {
    this.#pQueue = new PQueue({
      concurrency: this.#CONCURRENCY_LIMIT,
    });
    this.#pQueue.clear();
    if (this.#pQueue.isPaused) this.#pQueue.start();

    this.#pQueue.on('idle', () =>
      this.emit(SCANNER_EVENTS.DISPATCHER_FINISHED)
    );
  }

  stop() {
    this.#pQueue.removeListener('idle');
    this.#pQueue.clear();
    this.#pQueue.pause();
  }

  dispatchWfpFile(wfpPath) {
    this.#pQueue
      .add(() => this.#dispatch(wfpPath, this.#RETRIES))
      .catch((error) => this.emit('error', error));
  }

  async #dispatch(wfpFilePath, retryNum) {
    if (!retryNum) {
      console.error(`An error ocurred fetching the file ${wfpFilePath}`);
      return Promise.reject(
        new Error(
          `Failed to fetch ${wfpFilePath} after ${this.#RETRIES} retries`
        )
      );
    }
    try {
      let dataAsText = '';
      let dataAsObj = {};
      const wfpContent = fs.readFileSync(wfpFilePath);
      const form = new FormData();
      form.append('filename', Buffer.from(wfpContent), 'data.wfp');
      // form.append('User-Agent:', new Blob([this.#CLIENT_TIMESTAMP]));

      this.emit(SCANNER_EVENTS.DISPATCHER_WFP_SENDED, wfpFilePath);

      // Fetch
      const p1 = fetch(this.#API_URL, {
        method: 'post',
        body: form,
      });

      // Timeout
      const p2 = new Promise((resolve, reject) => {
        const id = setTimeout(() => {
          clearTimeout(id);
          reject(new Error('TIMEOUT'));
        }, this.#TIMEOUT);
      });

      const response = await Promise.race([p1, p2]);

      if (!response.ok) throw new Error('Server communication failed');
      dataAsText = await response.text();
      dataAsObj = JSON.parse(dataAsText);
      this.emit(
        SCANNER_EVENTS.DISPATCHER_NEW_DATA,
        new DispatcherResponse(dataAsObj, wfpFilePath)
      );
      return Promise.resolve();
    } catch (error) {
      if (error.message === 'TIMEOUT') {
        return this.#dispatch(wfpFilePath, retryNum - 1);
        // eslint-disable-next-line no-else-return
      } else {
        return Promise.reject(new Error(error));
      }
    }
  }
}
