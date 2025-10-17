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
  url?: string;
  purl?: string;
}

export interface Algorithms {
  algorithm: string;
  strength: string;
}

export interface CryptographicItem {
  fileId: number;
  name: string; // filePath | pkg@version
  type: string; // algorithm | library
  values: Array<string>;
}
