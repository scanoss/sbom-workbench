const path = require('path');
const fs = require('fs');
const { parentPort } = require('worker_threads');
const inspectDirectory = require("./inspect_directory")
const isBinaryFileSync = require("isbinaryfile").isBinaryFileSync;


const winnowing = require ("./winnowing.js");


let cfg = {}

parentPort.on('message', (wfpGeneratorCfg) => {
  cfg = wfpGeneratorCfg;
  generateWFP();
});


function generateWFP() {

  //Clean the directory
  if (fs.existsSync(cfg.queuePath)){
    fs.rmdirSync(cfg.queuePath, { recursive: true });
  }
  fs.mkdirSync(cfg.queuePath, {recursive: true});

  const result = recursiveWalk(cfg.scanPath);
/*
  result.then(() => {

    process.exit(0);

  }); */

}




// if((!isBinaryFileSync(contents, size)) && size<MAX_FILE_SIZE)  {
//   let preWfp = calc_wfp(contents);
//   if (preWfp.length <= MAX_SIZE_CHUNK) {
//     wfp+=preWfp;
//   }
// }





async function recursiveWalk(scanPath) {

  let preWfp = '';
  let wfp = '';
  let counter = 0;

  let index = 0;  //Count how many files have been stored in the queuePath;

  for await (const filepath of inspectDirectory.walk(scanPath)) {
        preWfp = winnowing.wfp_for_file(filepath, filepath.replace(scanPath, ''));
        counter++;
        if (wfp.length + preWfp.length >= cfg.MAX_WFP_SIZE) {
          queue_scan(wfp, counter, index);
          index++;
          wfp = '';
          counter = 0;
        }
        wfp +=preWfp;
  }

  if (cfg.scanPath === scanPath && wfp !== '') {
    queue_scan(wfp, counter, index);
  }

  return counter;
}



function queue_scan(wfp, counter, _index) {

  if (!fs.existsSync(cfg.queuePath)) {
    fs.mkdirSync(cfg.queuePath);
  }
  let wfpPath = `${cfg.queuePath}/${new Date().getTime()}.json`;


  //The next lines do the following:
  //  - Store de WFP results on a file in the temporary directory
  //  - Send a message to main thread
  fs.writeFileSync(wfpPath, JSON.stringify({ wfp: wfp, counter: counter, status: "ok" }));

  // let message = {};
  // message.wfpGenerator.wfpPath = wfpPath;
  // message.wfpGenerator.counter = counter;
  // message.wfpGenerator.status = "ok";
  // message.wfpGenerator.index = index++;
  //parentPort.postMessage(message);

  parentPort.postMessage({wfp: wfpPath, counter: counter, status: "ok"});

}
