/**
 * Entry point of scanner subprocess
 */
import { DecompressThread } from './scanner/DecompressThread';


process.parentPort.once('message', async (e) => {
  // const [port] = e.ports;
  const { action, data } = e.data;
  if (action === 'DECOMPRESS') {
    const decompressThread = new DecompressThread(data);
    const success = await decompressThread.run();
    process.parentPort.postMessage({
      event: success ? 'success' : 'error',
      data: success
    });
  }
});
