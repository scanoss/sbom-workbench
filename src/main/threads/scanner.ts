/**
 * Entry point of scanner subprocess
 */
import { DecompressThread } from './scanner/DecompressThread';


process.parentPort.once('message', async (e) => {
  // const [port] = e.ports;
  const { action, data } = e.data;
  if (action === 'DECOMPRESS') {
    try {
      const decompressThread = new DecompressThread(data.scanRoot, {
        recursive: data.recursive,
        maxDepth: data.maxDepth,
      });
      const results = await decompressThread.run();
      const hasIssues = results.failedFiles.length > 0 || results.skippedByDepth.length > 0;
      if (!hasIssues) {
        process.parentPort.postMessage({
          event: 'success',
          data: true
        });
      } else {
        process.parentPort.postMessage({
          event: 'error',
          error: JSON.stringify(results)
        });
      }
    } catch(e: any){
      process.parentPort.postMessage({
        event: 'error',
        error: e.message
      });
    }
  }
});
