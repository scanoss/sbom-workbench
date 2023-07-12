import { DecompressionManager } from 'scanoss';

function run() {
  const decompressionManager = new DecompressionManager();
  console.log("hey Agus, estoy dentro de un thread :)");
  console.log(decompressionManager);

  process.parentPort.postMessage({
    event: 'event-test',
  });
}

/**
 * Entry point of scanner subprocess
 */
process.parentPort.once('message', (e) => {
  // const [port] = e.ports;
  run();
})
