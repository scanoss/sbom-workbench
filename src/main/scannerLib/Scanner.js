//2.0
const EventEmitter = require('events');
const os = require('os');

const { AbstractScannable } = require('./Scannable/AbstractScannable');
const { ScannableTree } = require('./Scannable/ScannableTree');
const { ScannableFolder } = require('./Scannable/ScannableFolder') ;
const { Winnower } = require('./Winnower/Winnower');
const { Dispatcher } = require('./Dispatcher/Dispatcher');
const { DispatcherResponse } = require('./Dispatcher/DispatcherResponse');

const { SCANNER_EVENTS } = require('./ScannerEvents');
const fs = require('fs');

class Scanner extends EventEmitter{

    //Private properties
    #scannable;
    #winnower;
    #dispatcher;
    
    #wfpDestPath = os.tmpdir() + '/ScanossDesktopApp';
    #resultFilePath = this.#wfpDestPath + '/result.json';
    
    #tmpResult;

    constructor() {
        super();

        this.#winnower = new Winnower(); 
        this.#dispatcher = new Dispatcher();
        this.#tmpResult = {};


        /* SETTING WINNOWING THREAD EVENTS */
        this.#winnower.on(SCANNER_EVENTS.WINNOWING_STARTING, () => {
            this.emit(SCANNER_EVENTS.WINNOWING_STARTING);
        });

        this.#winnower.on(SCANNER_EVENTS.WINNOWING_NEW_WFP_FILE, (wfpPath) => {
            this.emit(SCANNER_EVENTS.WINNOWING_NEW_WFP_FILE, wfpPath);
            this.#dispatcher.dispatchWfpFile(wfpPath);
        });
        this.#winnower.on(SCANNER_EVENTS.WINNOWING_FINISHED, () => {
            this.emit(SCANNER_EVENTS.WINNOWING_FINISHED);
        });
        /* SETTING WINNOWING THREAD EVENTS */
        

        
        /* SETTING DISPATCHER EVENTS */
        this.#dispatcher.on(SCANNER_EVENTS.DISPATCHER_WFP_SENDED, (wfpPath) => {
            this.emit(SCANNER_EVENTS.DISPATCHER_WFP_SENDED, wfpPath);
        });
        
        this.#dispatcher.on(SCANNER_EVENTS.DISPATCHER_NEW_DATA, (dispatcherResponse) => {
            Object.assign(this.#tmpResult, dispatcherResponse.getServerData() );
            this.emit(SCANNER_EVENTS.DISPATCHER_NEW_DATA, dispatcherResponse);
        });

        this.#dispatcher.on(SCANNER_EVENTS.DISPATCHER_FINISHED, () => {
            let str = JSON.stringify(this.#tmpResult, null, 4);
            fs.writeFileSync(this.#resultFilePath, str);
            this.emit(SCANNER_EVENTS.SCAN_DONE, this.#resultFilePath);
        });
        /* SETTING DISPATCHER EVENTS */

        
    }

    async #scan() {
        await this.#scannable.prepare();
        await this.#winnower.startMachine(this.#scannable, this.#wfpDestPath);
    }


    async scanFileTree( fileTreeDescriptor ) {
        this.#scannable = new ScannableTree(fileTreeDescriptor);
        await this.#scan();
    }

    async scanFolder(dirPath) {
        this.#scannable = new ScannableFolder(dirPath);
        await this.#scan();
    }



}



module.exports = {
    Scanner,
    SCANNER_EVENTS,
}