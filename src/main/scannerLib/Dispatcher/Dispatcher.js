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

  #queueMaxLimitReached;

  #queueMinLimitReached;

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
    this.#wfpFailed = {};
    this.#queueMaxLimitReached = false;
    this.#queueMinLimitReached = true;
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

  dispatchWfpContent(wfpContent) {
    this.#pQueue
      .add(() => this.#dispatch(wfpContent))
      .catch((error) => {
        this.#errorHandler(error);
      });

    if ( (this.#pQueue.size + this.#pQueue.pending) >= this.#scannerCfg.DISPATCHER_QUEUE_SIZE_MAX_LIMIT && !this.#queueMaxLimitReached) {
      this.emit(ScannerEvents.DISPATCHER_QUEUE_SIZE_MAX_LIMIT);
      this.#queueMaxLimitReached = true;
      this.#queueMinLimitReached = false;
    }
  }

  #errorHandler(error) {
    // a) El server cierra el socket 'ECONNRESET' Seguir reintentando n veces
    // b) Hay timeout en el .wfp 'TIMEOUT'  Tendria que reintentar x veces ese especifico wfp
    // c) Error en el parser error directo
    // d) Error en la coneccion internet error directo
    // e) Couta terminada error directo
    // f) Cliente desactualizado error directo

    // switch(error.code) {
    //   case 'ECONNRESET': // Server closes the socket.
    //     break;

    //   default:

    // }


    // if (error.code === 'ECONNRESET')
    //   // Se agrega al final de la cola y que no se alla mandado mas de x veces
    // if (error.code === 'PARSER-ERROR')
    //   this.emit('error', error);

    // if ( this.#wfpFailed[error.wfpFailedPath] > 3 ) {
    //   this.emit('error', error);
    // }

    this.emit('error', error);
  }

  async #dispatch(wfpContent) {
    try {
      let dataAsText = '';
      let dataAsObj = {};
      const form = new FormData();
      form.append('filename', wfpContent, 'data.wfp');

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
      const dispatcherResponse = new DispatcherResponse(dataAsObj, wfpContent);
      this.emit(ScannerEvents.DISPATCHER_NEW_DATA, dispatcherResponse);
      return await Promise.resolve();
    } catch (error) {
        if (error.name !== ScannerEvents.ERROR_SERVER_SIDE) error.name = ScannerEvents.ERROR_CLIENT_SIDE;
        throw error;
    }
  }
}
