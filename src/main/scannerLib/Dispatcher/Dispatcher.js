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
  #CONCURRENCY_LIMIT = 6;

  // Timeout for each transaction
  #TIMEOUT = 15000;

  // Max number of retries for each transaction
  #RETRIES = 3;

  // Promises queue
  #pQueue;

  // Number of promises running at given time.
  #numPromisesRunning;

  // Error counter (Resets every time a transaction is complete)
  #errorCounter;

  constructor() {
    super();
    this.init();
  }

  init() {

    this.#numPromisesRunning = 0;

    this.#pQueue = new PQueue({
      concurrency: this.#CONCURRENCY_LIMIT,
      timeout: this.#TIMEOUT,
      throwOnTimeout: true,
    });
    this.#pQueue.clear();
    if (this.#pQueue.isPaused) this.#pQueue.start();

    this.#pQueue.on('idle', () => {
      this.emit(SCANNER_EVENTS.DISPATCHER_FINISHED)
    });

    // Only works for 7.x.x versions
    // this.#pQueue.on('error', (error) => {
    //   console.log("ERROR CATCHED....");
    //   this.#errorHandler(error);
    // });
  }

  stop() {
    this.#pQueue.removeListener('idle');
    this.#pQueue.clear();
    this.#pQueue.pause();
  }

  pause() {
    this.#pQueue.clear();
    this.#pQueue.pause();
  }

  resume() {
    this.#pQueue.start();
  }

  dispatchWfpFile(wfpPath) {
    this.#pQueue
      .add(() => this.#dispatch(wfpPath, this.#RETRIES))
      .catch((error) => {
        this.#errorHandler(error);
      });
  }

  #errorHandler(error) {
    console.log(`pQueue Pending: ${this.#pQueue.pending}`);
    console.log(`Manual counter: ${this.#numPromisesRunning}`);
    this.#errorCounter += 1;

    this.emit('error', error);
  }

  async #dispatch(wfpFilePath, retryNum) {
    this.#numPromisesRunning += 1;
    if (!retryNum) {
      // this.emit('error', new Error(`Failed to fetch ${wfpFilePath} after ${this.#RETRIES} retries`));
      this.#numPromisesRunning -= 1;
      throw new Error(`Failed to fetch after ${this.#RETRIES} retries`);
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

      //  Timeout
      const p2 = new Promise((resolve, reject) => {
        const id = setTimeout(() => {
          clearTimeout(id);
          reject(new Error('TIMEOUT'));
        }, this.#TIMEOUT);
      });
      const response = await Promise.race([p1, p2]);


      if (!response.ok){
        this.#numPromisesRunning -= 1;
        throw new Error('Server communication failed');
      }
      dataAsText = await response.text();
      dataAsObj = JSON.parse(dataAsText);
      this.emit(SCANNER_EVENTS.DISPATCHER_NEW_DATA, new DispatcherResponse(dataAsObj, wfpFilePath));
      this.#numPromisesRunning -= 1;
      return Promise.resolve();
    } catch (error) {
      if (error.message === 'TIMEOUT') {
        console.log("Retrying....")
        return this.#dispatch(wfpFilePath, retryNum - 1);
      }
      if (error.code === 'EAI_AGAIN') console.log('No Internet connection...');
      this.#numPromisesRunning -= 1;
      throw new Error(error);

    }
  }
}
