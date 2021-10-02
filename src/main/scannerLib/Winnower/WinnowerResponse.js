export class WinnowerResponse {
  #wfpContent;

  #date;

  #scanRoot;

  constructor(wfpContent, scanRoot = '') {
    this.#wfpContent = wfpContent;
    this.#scanRoot = scanRoot;
  }

  isEqual(winnowerResponse) {
    return this.getContent() === winnowerResponse.getContent();
  }

  getContent() {
    return this.#wfpContent;
  }

  getFilesWinnowed() {
    const files = [];
    const regExp = new RegExp(/,(\/.*)/g);
    let result;
    // eslint-disable-next-line no-cond-assign
    while ((result = regExp.exec(this.#wfpContent))) files.push(this.#scanRoot + result[1]);
    return files || '';
  }
}
