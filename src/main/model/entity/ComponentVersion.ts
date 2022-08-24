export class ComponentVersion {
  private licenseIds: Array<number>;

  id?: number;

  name: string;

  description?: string;

  version: string;

  url?: string;

  source: ComponentSource;

  purl: string;

  reliableLicense?: string;

  // licenses: Array<License>

  public setLicenseIds(licensesIds: Array<number>) {
    this.licenseIds = licensesIds;
  }

  public getLicenseIds(): Array<number> {
    return this.licenseIds;
  }
}

export enum ComponentSource {
  ENGINE = 'engine',
  MANUAL = 'manual',
}
