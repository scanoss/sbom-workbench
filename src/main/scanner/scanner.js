const cliProgress = require('cli-progress');
const scanner = require('./lib/scanner');
const ipcMain = require('electron');
const fs = require('fs');

let resultPath;

async function scan(scanPath, resultsPath) {
  let results;
  let files;

  resultPath = resultsPath;

  files = await scanner.countFiles(scanPath);

  createProgressBars(files.filesFound);

  if (files.filesFound == 0 && results.wfpsFound.length == 0)
    process.exit('No files to scan');

  if (files.wfpsFound.length > 0)
    process.exit(
      `Have been found .wfp files\n${files}\nScanning those files is not supported yet, please remove those files.`
    );

  if (!files.wfpsFound.length) {
    results = await scanner.scanFolder(scanPath);
  }
}

scanner.addEventListener('onWfpGenerated', (data) => {
  fingerprintProgressBar.increment(data.counter);
});

scanner.addEventListener('onServerResponse', (data) => {
  fetchingProgressBar.increment(data.counter);
});

/*scanner.addEventListener('onScanDone', (result) => {
  console.log("scanDone");

  fs.writeFileSync(resultPath,JSON.stringify(result, null, 4), 'utf8');

  //Emit an event to DB module and frontEnd
});*/

// Not implemented yet
scanner.addEventListener('onError', (error) => {
  console.log(error);
});


let multiProgressBar;
let fingerprintProgressBar;
let fetchingProgressBar;

function createProgressBars(numbersOfFiles) {
  multiProgressBar = new cliProgress.MultiBar(
    {
      clearOnComplete: false,
      hideCursor: true,
    },
    cliProgress.Presets.shades_grey
  );

  fingerprintProgressBar = multiProgressBar.create(numbersOfFiles, 0);
  fetchingProgressBar = multiProgressBar.create(numbersOfFiles, 0);
}

module.exports = {
  scan,
};
