export enum FormatVersion {
  SPDX20 = 'SPDX20',
  SPDXLITE = 'SPDXLITE',
  CSV = 'CSV',
  RAW = 'RAW',
}
export abstract class Format {
  public abstract generate();

  public abstract save(path:string,complete?: boolean);
}
