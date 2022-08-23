export class ComponentVersion {
  private licenseIds: Array<number>;

  id?: number;

  name: string;

  description?: string;

  version: string;

  url?: string;

  source: componentSource;

  purl: string;

  relialableLicense?: string;

  public setLicenseIds(licensesIds: Array<number>) {
    this.licenseIds = licensesIds;
  }

  public getLicenseIds(): Array<number> {
    return this.licenseIds;
  }
}

export enum componentSource {
  ENGINE = 'engine',
  MANUAL = 'manual',
}
