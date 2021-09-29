import fs from 'fs';

export class DispatcherResponse {
  #serverResponse;

  #wfpContent;

  #wfpFilePath;

  #filesScanned;

  constructor(serverResponse, wfpContent, wfpFilePath) {
    this.#serverResponse = serverResponse;
    this.#wfpFilePath = wfpFilePath;
    this.#wfpContent = wfpContent;
    this.#filesScanned = Object.keys(this.#serverResponse);
    // this.#verifyResponse();
  }

  getServerResponse() {
    return this.#serverResponse;
  }

  getWfpContent() {
    return this.#wfpContent;
  }

  getWfpFilePath() {
    return this.#wfpFilePath;
  }

  #matchRegex(str, re = /file=/g) {
    return ((str || '').match(re) || []).length;
  }

  #verifyResponse() {
    const wfpNumFiles = this.#matchRegex(this.#wfpContent, /file=/g);

    const serverResponseNumFiles = Object.keys(this.#serverResponse).length;

    if (wfpNumFiles !== serverResponseNumFiles) {
      console.log(`The numbers of files in ${this.#wfpFilePath} does not match with the server response`);
      throw new Error(`The numbers of files in ${this.#wfpFilePath} does not match with the server response`);
    }
  }

  getFilesScanned() {
    return this.#filesScanned;
  }

  getNumberOfFilesScanned() {
    return this.#filesScanned.length;
  }
}
