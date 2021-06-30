import { Worker } from 'worker_threads';
import fs from 'fs';
import EventEmitter from 'events';
import { SCANNER_EVENTS } from '../ScannerEvents.js';

export class Winnower extends EventEmitter {
  // Configurable parameters
  #WFP_FILE_MAX_SIZE = 64 * 1000;

  #scannable;

  #destFolder;

  #wfp;

  #worker = new Worker('./src/main/scannerLib/Winnower/winnowingThread.js');

  constructor() {
    super();
    this.#wfp = '';
    this.#worker.on('message', async (winnowingResult) => {
      this.#storeResult(winnowingResult);
      this.#nextStepMachine();
    });
  }

  async #storeResult(winnowingResult) {
    if (this.#wfp.length + winnowingResult.length >= this.#WFP_FILE_MAX_SIZE) {
      await this.#createWfpFile(
        this.#wfp,
        this.#destFolder,
        new Date().getTime()
      );
      this.#wfp = '';
    }
    this.#wfp += winnowingResult;
  }

  async #createWfpFile(content, dst, name) {
    if (!fs.existsSync(dst)) fs.mkdirSync(dst);
    await fs.promises.writeFile(`${dst}/${name}.wfp`, content);
    this.emit(SCANNER_EVENTS.WINNOWING_NEW_WFP_FILE, `${dst}/${name}.wfp`);
  }

  async #nextStepMachine() {
    const scannableItem = await this.#scannable.getNextScannableItem();
    if (this.#scannable.hasNextScannableItem()) {
      this.#worker.postMessage(scannableItem);
    } else {
      if (this.#wfp.length != 0)
        await this.#createWfpFile(
          this.#wfp,
          this.#destFolder,
          new Date().getTime()
        );
      this.emit(SCANNER_EVENTS.WINNOWING_FINISHED);
      this.#worker.terminate();
    }
  }

  async startMachine(scannable, destPath) {
    this.#scannable = scannable;
    this.#destFolder = destPath;
    this.emit(SCANNER_EVENTS.WINNOWING_STARTING);
    return this.#nextStepMachine();
  }
}
