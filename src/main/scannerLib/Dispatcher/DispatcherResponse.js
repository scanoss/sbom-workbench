const fs = require('fs');

class DispatcherResponse  {

    #serverData;
    #wfpFilePath;

    constructor(serverData, wfpFilePath) {
        this.#serverData = serverData;
        this.#wfpFilePath = wfpFilePath;
    }

    getServerData() {return this.#serverData}
    getWfpContent() {return fs.readFileSync(this.#wfpFilePath)}
    getAssociatedWfp() {return this.#wfpFilePath}
}


module.exports = {
    DispatcherResponse,
}