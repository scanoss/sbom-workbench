export class WinnowerResponse {
  #wfpContent;

  #date;

  constructor(wfpContent) {
    this.#wfpContent = wfpContent;
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
    while ((result = regExp.exec(this.#wfpContent))) files.push(result[1]);

    return files;
  }

}
