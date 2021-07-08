import { Worker, isMainThread, parentPort } from 'worker_threads';
import fs from 'fs';
import EventEmitter from 'events';
import { SCANNER_EVENTS } from '../ScannerEvents.js';

const stringWorker = `
const { parentPort } = require('worker_threads');

parentPort.on('message', async (scannableItem) => {
  const fingerprint = wfp_for_content(
    scannableItem.content,
    scannableItem.contentSource
  );
  parentPort.postMessage(fingerprint);
});


const crypto = require('crypto');

const isWin = process.platform === 'win32';
const pathSeparator = isWin ? String.fromCharCode(92) : '/';

// Winnowing configuration. DO NOT CHANGE.
const GRAM = 30;
const WINDOW = 64;

// ASCII characters
const ASCII_0 = 48;
const ASCII_9 = 57;
const ASCII_A = 65;
const ASCII_Z = 90;
const ASCII_a = 97;
const ASCII_z = 122;
const ASCII_LF = 10;

function normalize(byte) {
  if (byte < ASCII_0 || byte > ASCII_z) {
    return 0;
  }
  if (byte <= ASCII_9 || byte >= ASCII_a) {
    return byte;
  }
  if (byte >= ASCII_A && byte <= ASCII_Z) {
    return byte + 32;
  }
  return 0;
}

function min_hex_array(array) {
  let min = 'ffffffff';
  for (let i = 0; i < array.length; i++) {
    if (array[i] < min) {
      min = array[i];
    }
  }
  return min;
}

function wfp_for_content(contents, contentSource) {
  const file_md5 = crypto.createHash('md5').update(contents).digest('hex');
  let wfp = 'file=' + String(file_md5) + ',' + String(contents.length) + ',' + String(contentSource)+ String.fromCharCode(10);
  wfp += calc_wfp(contents);
  return wfp;
}

function calc_wfp(contents) {
  let gram = '';
  const window = [];
  let normalized = 0;
  let line = 1;
  let min_hash = 'ffffffff';
  let last_hash = 'ffffffff';
  let last_line = 0;
  let output = '';
  let gram_crc32 = 0;
  let wfp = '';

  for (let i = 0; i < contents.length; i++) {
    const byte = contents[i];
    if (byte == ASCII_LF) {
      line += 1;
      normalized = 0;
    } else {
      normalized = normalize(byte);
    }
    // Is this an useful byte?
    if (normalized) {
      gram += String.fromCharCode(normalized);

      if (gram.length >= GRAM) {
        gram_crc32 = crc32c_hex(gram);
        window.push(gram_crc32);

        if (window.length >= WINDOW) {
          min_hash = min_hex_array(window);
          if (min_hash !== last_hash) {
            // Hashing the hash will result in a better balanced output data set
            // as it will counter the winnowing effect which selects the "minimum"
            // hash in each window
            const min_hash_bytes_le = parseHexString(
              toLittleEndianCRCHex(min_hash)
            );
            const crc_hex = crc32c_for_bytes_hex(min_hash_bytes_le);

            if (last_line != line) {
              if (output.length > 0) {
                wfp += String(output) + String.fromCharCode(10);
              }
              output = String(line) + '=' + String(crc_hex);
            } else {
              output += ',' + String(crc_hex);
            }
            last_line = line;
            last_hash = min_hash;
          }
          window.shift();
        }
        gram = gram.slice(1);
      }
    }
  }
  if (output.length > 0) {
    wfp += String(output) + String.fromCharCode(10);
  }

  return wfp;
}

function parseHexString(str) {
  const result = [];
  while (str.length >= 2) {
    result.push(parseInt(str.substring(0, 2), 16));
    str = str.substring(2, str.length);
  }

  return result;
}

/**
 *
 * @param {string} hex
 */
function toLittleEndianCRCHex(hex) {
  return (
    hex.charAt(6) +
    hex.charAt(7) +
    hex.charAt(4) +
    hex.charAt(5) +
    hex.charAt(2) +
    hex.charAt(3) +
    hex.charAt(0) +
    hex.charAt(1)
  );
}

let CRC_TABLE = [];

function makeCRCTable() {
  let c;
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0x82f63b78 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c;
  }
  return crcTable;
}

function crc32c(str) {
  if (CRC_TABLE.length == 0) {
    CRC_TABLE = makeCRCTable();
  }
  let crc = 0 ^ -1;

  for (let i = 0; i < str.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ str.charCodeAt(i)) & 0xff];
  }

  return (crc ^ -1) >>> 0;
}

function crc32c_for_bytes(bytes) {
  if (CRC_TABLE.length == 0) {
    CRC_TABLE = makeCRCTable();
  }
  let crc = 0 ^ -1;

  for (let i = 0; i < bytes.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ bytes[i]) & 0xff];
  }

  return (crc ^ -1) >>> 0;
}

function crc32c_for_bytes_hex(bytes) {
  return crc32c_for_bytes(bytes).toString(16).padStart(8, '0');
}

function crc32c_hex(str) {
  return crc32c(str).toString(16).padStart(8, '0');
}

`;

export class Winnower extends EventEmitter {
  // Configurable parameters
  #WFP_FILE_MAX_SIZE = 64 * 1000;

  #scannable;

  #destFolder;

  #wfp;

  #worker;

  #continue;

  #isRunning;

  constructor() {
    super();
    this.init();
  }

  init() {
    this.#wfp = '';
    this.#continue = true;
    this.#worker = new Worker(stringWorker, { eval: true });
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
    if (!this.#continue) return;
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
      this.#isRunning = false;
      this.emit(SCANNER_EVENTS.WINNOWING_FINISHED);
      this.#worker.terminate();
    }
  }

  async startMachine(scannable, destPath) {
    this.#scannable = scannable;
    this.#destFolder = destPath;
    this.#isRunning = true;
    this.emit(SCANNER_EVENTS.WINNOWING_STARTING);
    return this.#nextStepMachine();
  }

  stop() {
    this.#continue = false;
  }

  resume() {
    this.#continue = true;
    this.#nextStepMachine();
  }

  isRunning() {
    return this.#isRunning;
  }
}
