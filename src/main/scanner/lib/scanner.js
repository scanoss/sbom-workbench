//Builts-in libraries
const os = require("os");
const path = require('path');
const process = require('process');

const fs = require ("fs");
const {Worker} = require('worker_threads');

//Internal Libraries
const wfpGenerator = new Worker("./src/main/scanner/lib/wfp_generator.js");
const wfpProcessor = require("./wfp_processor.js");
const inspectDirectory = require('./inspect_directory');

let results = {};

let wfpGeneratorCfg = {
    scanPath: null,
    queuePath: `${os.tmpdir}/QS-queue/${process.pid}`,
    resultsPath: `/home/ubuntu/Projects/SCANOSS/scanoss-cli-jslib/results/result.json`,

    MAX_WFP_SIZE: 64* 1024,     //It's recommended not send to the server a WFP bigger than 64Kb
    MAX_FILES: 0,               //NOT IMPLEMENTED YET //A maximum number of files to scan. 0 is unlimited
    MAX_FILE_SIZE: 4 * 1024,    //Files bigger than 4MB won't qualify for generate WFP
    MIN_FILE_SIZE: 256
}


let EVENTS  = {
    onDataAvailable : undefined,
    onWfpGenerated: undefined,
    onServerResponse: undefined,
    onScanDone: undefined,
};


function addEventListener(eventName, f) {
    if(EVENTS.hasOwnProperty(eventName))  //The event must be on the EVENT object
        switch(eventName){
            case 'onDataAvailable':
                EVENTS.onDataAvailable=f;
                break;
            case 'onWfpGenerated':
                EVENTS.onWfpGenerated=f;
                break;
            case 'onServerResponse':
                EVENTS.onServerResponse=f;
                break;
            case 'onScanDone':
                EVENTS.onScanDone=f;
            default:
                return -1;
        }
    return 0;   //Event Listener added sucessfully
}



/***************** INTERFACE *****************/
function scanFolder(scanPath, scanResultsPath) {



    wfpGeneratorCfg.scanPath=scanPath;
    wfpGenerator.postMessage(wfpGeneratorCfg);  //Inits the WFP generation
}





//Inspects the directory and find how many files are in the folder
//Returns a promise. When resolved contain an object
//
// {
//     filesFound: 0,   //How many files have been found.
//     wfpsFound: []    //A list of wfps files found.
// }
function countFiles(scanPath) {
    const p = inspectDirectory.countFiles(scanPath);
    p.then(directoryInspected => {
        wfpProcessor.init(directoryInspected.filesFound);
    });

    return p;
}


function extractData() {
    return wfpProcessor.extractData()
}
/***************** INTERFACE *****************/





/***************** WFP GENERATOR SECTION *****************/
wfpGenerator.on("message", (rx) => wfpGeneratorMessageHandler(rx));
function wfpGeneratorMessageHandler(msg) {
    //wfp.wfp: contains the path to the wfp generated
    //wfp.status: specify the status result of the wfp generated. ok or error
    //wfp.counter: Include a list of files on the wfp generated

    if (EVENTS.onWfpGenerated != null)
        EVENTS.onWfpGenerated(msg);

    wfpProcessor.process(msg);



}
/***************** WFP GENERATOR SECTION *****************/



/***************** SERVER COMMUNICATION SECTION *****************/

wfpProcessor.addEventListener("onServerResponse", (data) => {
    if (EVENTS.onServerResponse != null)
        EVENTS.onServerResponse(data);

        Object.assign(results,data.serverResponse);
        //results = {...results, ...data.serverResponse};
        //results.push(data.serverResponse)

});



wfpProcessor.addEventListener("onDataAvailable", () => {
    if (EVENTS.onDataAvailable != undefined)
        EVENTS.onDataAvailable();
});


wfpProcessor.addEventListener("onScanDone", () => {
    if (EVENTS.onScanDone != undefined)
        EVENTS.onScanDone(results);
});
/***************** SERVER COMMUNICATION SECTION *****************/




module.exports = {

    addEventListener,
    scanFolder,
    countFiles,
    extractData,

}
