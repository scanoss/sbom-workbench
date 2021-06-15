const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

/* CONFIGURABLE PARAMETERS */
const concurrencyLimit = 3;
const timeout = 60000;
const maxRetries = 3;
/* CONFIGURABLE PARAMETERS */

let inputBuffer; // Buffer where the WFPs strings are stored before fetched to the server.
let incrementalCounter; // Incremental counter per each wfp package received.
let promisesRunning; // Amount of Promises executing in a single moment of time.
let promisesStatus;
let promises; // Where the promises are stored

let results = []; // Resolved promises store the result in this array.
let extractedData;

/* Callbacks */
let onServerResponse;
let onDataAvailable;
function addEventListener(string, f) {
  if (string === 'onServerResponse') {
    onServerResponse = f;
  }

  if (string === 'onDataAvailable') {
    onDataAvailable = f;
  }
}

/* Prepare the module for a new scan */
function init() {
  inputBuffer = [];
  incrementalCounter = 0;
  promisesRunning = 0;
  extractedData = 0;
  promisesStatus = new Array(concurrencyLimit).fill('free');
  promises = new Array(concurrencyLimit).fill(Promise.resolve());
}

function getAvailableData() {
  const extractFromIndex = 0;
  const extractToIndex = results.findIndex((e) => e === undefined);
}

function extractData() {
  const extractFromIndex = 0;
  const extractToIndex = results.findIndex((e) => e === undefined);

  // Only when the first result is done the user can extract data
  if (results[extractFromIndex] === undefined) return -1;

  // Copy only the results resolved
  const partialResults = [...results.slice(extractFromIndex, extractToIndex)];

  // Delete all the results returned to the user..
  results = results.slice(extractToIndex, results.lenght);

  extractedData += extractToIndex - extractFromIndex;

  return partialResults;
}

// Recursively chain the next Promise to the currently executed Promise
function chainNext(p, index) {
  if (inputBuffer.length) {
    const data = inputBuffer.shift();
    return p.then(() => {
      const operationPromise = fetcher(data)
        .then((serverResponse) => serverResponse.text())
        .then((serverResponse) => {
          // results[data.arrivalOrder-extractedData]={serverResponse: serverResponse, index: data.arrivalOrder};

          data.serverResponse = serverResponse;
          results[data.arrivalOrder - extractedData] = data;

          onServerResponse(data);

          if (!(results[0] === undefined)) {
            const count = getAvailableData();
            onDataAvailable(count);
          }
        });

      return chainNext(operationPromise, index);
    });
  }
  promisesStatus[index] = 'free';
  return p;
}

/* Loads a wfp filepath to the module for further processing */
function process(wfp) {
  wfp.arrivalOrder = incrementalCounter++;
  inputBuffer.push(wfp);

  // inputBuffer.push({ arrivalOrder: incrementalCounter++, wfpPath: wfp.wfpPath, counter: wfp.counter});

  promisesStatus.forEach((status, index) => {
    if (status == 'free') {
      promisesStatus[index] = 'busy';
      promises[index] = chainNext(promises[index], index);
    }
  });
}

async function fetcher(data) {
  const json = JSON.parse(fs.readFileSync(data.wfp));

  const form = new FormData();
  form.append('filename', new Buffer.from(json.wfp), 'data.wfp');

  const res = await fetch('https://osskb.org/api/scan/direct', {
    method: 'post',
    body: form,
  });

  return res;
}

module.exports = {
  process,
  init,
  addEventListener,
  extractData,
};
