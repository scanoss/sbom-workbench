import EventEmitter from 'events';
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import PQueue from 'p-queue';
import { SCANNER_EVENTS } from '../ScannerEvents.js';
import { DispatcherResponse } from './DispatcherResponse.js';

export class Dispatcher extends EventEmitter {
  #CONCURRENCY_LIMIT = 3;

  #pQueue;

  constructor() {
    super();
    this.#pQueue = new PQueue({ concurrency: this.#CONCURRENCY_LIMIT });
    this.#pQueue.on('idle', () =>
      this.emit(SCANNER_EVENTS.DISPATCHER_FINISHED)
    );
  }

  dispatchWfpFile(wfpPath) {
    this.#pQueue.add(() => this.#dispatch(wfpPath));
  }

  async #dispatch(wfpFilePath) {
    let dataAsText = '';
    let dataAsObj = {};
    const wfpContent = fs.readFileSync(wfpFilePath);
    const form = new FormData();
    this.emit(SCANNER_EVENTS.DISPATCHER_WFP_SENDED, wfpFilePath);
    form.append('filename', new Buffer.from(wfpContent), 'data.wfp');
    const response = await fetch('https://osskb.org/api/scan/direct', {
      method: 'post',
      body: form,
    });
    if (response.ok) dataAsText = await response.text();
    dataAsObj = JSON.parse(dataAsText);
    this.emit(
      SCANNER_EVENTS.DISPATCHER_NEW_DATA,
      new DispatcherResponse(dataAsObj, wfpFilePath)
    );
  }
}
