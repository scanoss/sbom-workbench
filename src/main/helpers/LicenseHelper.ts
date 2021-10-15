class LicenseHelper {
  public licenseNameToSPDXID(licenseName: string) {
    const key = licenseName.toLowerCase().replace(/ /g, '-');

    // nueva licencia
    // -nueva-licencia

    // licencia

    const SPDXID = `LicenseRef-${key}`;

    return SPDXID;
  }
}
export const licenseHelper = new LicenseHelper();
