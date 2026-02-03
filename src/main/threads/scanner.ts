/**
 * Entry point of scanner subprocess
 */
import { DecompressThread } from './scanner/DecompressThread';


process.parentPort.once('message', async (e) => {
  // const [port] = e.ports;
  const { action, data } = e.data;
  if (action === 'DECOMPRESS') {
    try {
      const decompressThread = new DecompressThread(data);
      const results = await decompressThread.run();
      if(results.failedFiles.length<=0){
        process.parentPort.postMessage({
          event: 'success',
          data: true
        });
      }else{
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
