// import { parentPort } from 'worker_threads';
// import { wfp_for_content } from './winnowingAlgorithm.js';

const { parentPort } = require('worker_threads');
const winnowing = require('./winnowingAlgorithm.js');

parentPort.on('message', async (scannableItem) => {
  const fingerprint = winnowing.wfp_for_content(
    scannableItem.content,
    scannableItem.contentSource
  );
  parentPort.postMessage(fingerprint);
});
