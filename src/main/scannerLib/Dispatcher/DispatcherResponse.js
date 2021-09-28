import fs from 'fs';

export class DispatcherResponse {

  #serverResponse;

  // Path to the wfp sended to the server
  #wfpFilePath;

  constructor(serverResponse, wfpFilePath) {
    this.#serverResponse = serverResponse;
    this.#wfpFilePath = wfpFilePath;
    // this.#verifyResponse();
  }

  getServerResponse() {
    return this.#serverResponse;
  }

  getWfpContent() {
    return fs.readFileSync(this.#wfpFilePath);
  }

  getWfpFilePath() {
    return this.#wfpFilePath;
  }

  #matchRegex(str, re = /file=/g) {
    return ((str || '').match(re) || []).length;
  }

  #verifyResponse() {
    const wfpContent = String(fs.readFileSync(this.#wfpFilePath));
    const wfpNumFiles = this.#matchRegex(wfpContent, /file=/g);

    const serverResponseNumFiles = Object.keys(this.#serverResponse).length;

    if (wfpNumFiles !== serverResponseNumFiles) {
      console.log(`The numbers of files in ${this.#wfpFilePath} does not match with the server response`);
      throw new Error(`The numbers of files in ${this.#wfpFilePath} does not match with the server response`);
    }
  }

  getFilesScanned() {
    return Object.keys(this.#serverResponse);
  }
}
