export class DispatchableItem {
  #winnowerResponse;

  #errorCounter;

  constructor(winnowerResponse) {
    this.#winnowerResponse = winnowerResponse;
    this.#errorCounter = 0;
  }

  increaseErrorCounter() {
    this.#errorCounter += 1;
  }

  getWinnowerResponse() {
    return this.#winnowerResponse;
  }

  getContent() {
    return this.#winnowerResponse.getContent();
  }

  getErrorCounter() {
    return this.#errorCounter;
  }

}
