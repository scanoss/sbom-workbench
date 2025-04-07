export class ExportControl {
  purl: string;

  version: string;

  hints: Array<Hints>;
}

export interface Hints {
  id: string;
  name: string;
  description: string;
  category: string;
  url: string;
  purl: string;
}
