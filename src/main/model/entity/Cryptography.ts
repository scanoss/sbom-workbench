export class Cryptography {
  purl: string;

  version: string;

  algorithms: Array<Algorithms>;

  hints: Array<Hint>;
}

export interface Hint {
  id: string;
  name: string;
  description: string;
  category: string;
  url: string;
  purl: string;
}

export interface Algorithms {
  algorithm: string;
  strength: string;
}
