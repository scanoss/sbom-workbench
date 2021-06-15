const cliProgress = require('cli-progress');
const scanner = require('./lib/scanner');

const results = [];

// scan("./scanFolder");

async function scan(scanPath) {
  let results;
  let files;

  files = await scanner.countFiles(scanPath);

  createProgressBars(files.filesFound);

  if (files.filesFound == 0 && results.wfpsFound.length == 0)
    process.exit('No files to scan');

  if (files.wfpsFound.length > 0)
    process.exit(
      `Have been found .wfp files\n${files}\nScanning those files is not supported yet, please remove those files.`
    );

  if (!files.wfpsFound.length) {
    console.log('pass');
    results = await scanner.scanFolder(scanPath);
  }
}

scanner.addEventListener('onWfpGenerated', (data) => {
  fingerprintProgressBar.increment(data.counter);
});

scanner.addEventListener('onServerResponse', (data) => {
  fetchingProgressBar.increment(data.counter);
});

scanner.addEventListener('onDataAvailable', () => {
  results.push(...scanner.extractData());
});

// Not implementde yet
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
