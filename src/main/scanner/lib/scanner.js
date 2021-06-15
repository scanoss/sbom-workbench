// Builts-in libraries
const os = require('os');
const path = require('path');
const process = require('process');

const fs = require('fs');
const { Worker } = require('worker_threads');

// Internal Libraries
const wfpGenerator = new Worker('./src/main/scanner/lib/wfp_generator.js');
const wfpProcessor = require('./wfp_processor.js');
const inspectDirectory = require('./inspect_directory');

const wfpGeneratorCfg = {
  scanPath: null,
  queuePath: `${os.tmpdir}/QS-queue/${process.pid}`,

  MAX_WFP_SIZE: 64 * 1024, // It's recommended not send to the server a WFP bigger than 64Kb
  MAX_FILES: 0, // NOT IMPLEMENTED YET //A maximum number of files to scan. 0 is unlimited
  MAX_FILE_SIZE: 4 * 1024, // Files bigger than 4MB won't qualify for generate WFP
  MIN_FILE_SIZE: 256,
};

const EVENTS = {
  onDataAvailable: undefined,
  onWfpGenerated: undefined,
  onServerResponse: undefined,
};

function addEventListener(eventName, f) {
  if (EVENTS.hasOwnProperty(eventName))
    // The event must be on the EVENT object
    switch (eventName) {
      case 'onDataAvailable':
        EVENTS.onDataAvailable = f;
        break;
      case 'onWfpGenerated':
        EVENTS.onWfpGenerated = f;
        break;
      case 'onServerResponse':
        EVENTS.onServerResponse = f;
        break;

      default:
        return -1;
    }
  return 0; // Event Listener added sucessfully
}

/** *************** INTERFACE **************** */
function scanFolder(scanPath) {
  wfpGeneratorCfg.scanPath = scanPath;
  wfpGenerator.postMessage(wfpGeneratorCfg); // Inits the WFP generation
}

// Inspects the directory and find how many files are in the folder
// Returns a promise. When resolved contain an object
//
// {
//     filesFound: 0,   //How many files have been found.
//     wfpsFound: []    //A list of wfps files found.
// }
function countFiles(scanPath) {
  return inspectDirectory.countFiles(scanPath);
}

function extractData() {
  return wfpProcessor.extractData();
}
/** *************** INTERFACE **************** */

/** *************** WFP GENERATOR SECTION **************** */
function wfpGeneratorMessageHandler(wfp) {
  // wfp.wfp: contains the path to the wfp generated
  // wfp.status: specify the status result of the wfp generated. ok or error
  // wfp.counter: Include a list of files on the wfp generated

  if (EVENTS.onWfpGenerated != null) EVENTS.onWfpGenerated(wfp);

  wfpProcessor.process(wfp);
}

wfpGenerator.on('message', (rx) => wfpGeneratorMessageHandler(rx));
/** *************** WFP GENERATOR SECTION **************** */

/** *************** SERVER COMMUNICATION SECTION **************** */
wfpProcessor.init();
wfpProcessor.addEventListener('onServerResponse', (data) => {
  if (EVENTS.onServerResponse != null) EVENTS.onServerResponse(data);
});

wfpProcessor.addEventListener('onDataAvailable', () => {
  if (EVENTS.onDataAvailable !== undefined) EVENTS.onDataAvailable();
});
/** *************** SERVER COMMUNICATION SECTION **************** */

module.exports = {
  addEventListener,
  scanFolder,
  countFiles,
  extractData,
};
