class LicenseHelper {
  public licenseNameToSPDXID(licenseName: string) {
    const key = licenseName.trim().toLowerCase().replace(/ /g, '-');
    const SPDXID = `LicenseRef-${key}`;

    return SPDXID;
  }
}

export const licenseHelper = new LicenseHelper();
