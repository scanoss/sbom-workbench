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
}
