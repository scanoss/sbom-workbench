export class Cryptography {
  purl: string;

  version: string;

  algorithms: Array<Algorithms>;
}

export interface Algorithms {
  algorithm: string;
  strength: string;
}
