export interface INewComponent {
  name: string;
  description?: string;
  version: string;
  url?: string;
  source: componentSource;
  purl: string;
  licenses: Array<number>;
}

export enum componentSource {
  ENGINE = 'engine',
  MANUAL = 'manual'
}
