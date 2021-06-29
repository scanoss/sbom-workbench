import { parentPort } from 'worker_threads';
import { wfp_for_content } from './winnowingAlgorithm.js';

parentPort.on('message', async (scannableItem) => {
  const fingerprint = wfp_for_content(
    scannableItem.content,
    scannableItem.contentSource
  );
  parentPort.postMessage(fingerprint);
});
