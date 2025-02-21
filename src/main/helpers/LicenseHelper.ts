class LicenseHelper {
  public licenseNameToSPDXID(licenseName: string) {
    const key = licenseName.trim().toLowerCase().replace(/ /g, '-');
    const SPDXID = `LicenseRef-${key}`;

    return SPDXID;
  }

  public getStringOfLicenseNameFromArray(data: any) {
    let licenses = '';
    data.forEach((license: any) => {
      if (!licenses.includes(license.name) && license.name !== '') licenses += `${license.name},`;
    });
    return licenses.slice(0, -1);
  }

  public splitLicensesByOperator(licenses:string, operator: RegExp): Array<string> {
    return licenses
      .split(operator)
      .map((license: string) => license.trim())
      .filter(Boolean);
  }
}

export const licenseHelper = new LicenseHelper();
