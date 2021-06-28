const winnowing = require('./winnowingAlgorithm');
const { parentPort } = require('worker_threads');


parentPort.on('message', async (scannableItem) => {
    let fingerprint = winnowing.wfp_for_content(scannableItem.content,scannableItem.contentSource);            
    parentPort.postMessage(fingerprint);
  });
