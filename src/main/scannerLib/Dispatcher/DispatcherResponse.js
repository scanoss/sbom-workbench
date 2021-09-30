import fs from 'fs';

export class DispatcherResponse {
  #serverResponse;

  #wfpContent;

  #filesScanned;

  constructor(serverResponse, wfpContent) {
    this.#serverResponse = serverResponse;
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

  #matchRegex(str, re = /file=/g) {
    return ((str || '').match(re) || []).length;
  }

  #verifyResponse() {
    const wfpNumFiles = this.#matchRegex(this.#wfpContent, /file=/g);
    const serverResponseNumFiles = Object.keys(this.#serverResponse).length;
    if (wfpNumFiles !== serverResponseNumFiles) throw new Error(`The numbers of files in the wfp sended does not match with the server response`);
  }

  getFilesScanned() {
    return this.#filesScanned;
  }

  getNumberOfFilesScanned() {
    return this.#filesScanned.length;
  }
}
