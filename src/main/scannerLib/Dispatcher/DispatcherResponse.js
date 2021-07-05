import fs from 'fs';
import { stringify } from 'querystring';

export class DispatcherResponse {
  // Contains the server response
  #serverData;

  // Path to the wfp sended to the server
  #wfpFilePath;

  constructor(serverData, wfpFilePath) {
    this.#serverData = serverData;
    this.#wfpFilePath = wfpFilePath;
  }

  getServerData() {
    return this.#serverData;
  }

  getWfpContent() {
    return fs.readFileSync(this.#wfpFilePath);
  }

  getAssociatedWfp() {
    return this.#wfpFilePath;
  }

  #matchRegex(str, re = /file=/g) {
    return ((str || '').match(re) || []).length;
  }

  // This function checks the number of files in the .wfp are equal to the server response
  // return the match number
  getNumberOfFiles() {
    const wfpContent = String(fs.readFileSync(this.#wfpFilePath));
    const wfpNumFiles = this.#matchRegex(wfpContent, /file=/g);

    const serverResponseNumFiles = Object.keys(this.#serverData).length;

    if (wfpNumFiles !== serverResponseNumFiles) {
      console.log('Error in server response');
    }

    return serverResponseNumFiles;
  }
}
