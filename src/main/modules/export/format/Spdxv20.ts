import AppConfig from '../../../../config/AppConfigModule';
import { utilModel } from '../../../model/UtilModel';
import { Format } from '../Format';

export class Spdxv20 extends Format {
  constructor() {
    super();
    this.extension = '-SPDXV20.json';
  }

  // @override
  public async generate() {
    const data = await this.export.getIdentifiedData();
    const spdx = Spdxv20.template();
    spdx.Packages = [];
    spdx.creationInfo.created = utilModel.getTimeStamp();
    for (let i = 0; i < data.length; i += 1) {
      const pkg: any = {};
      pkg.name = data[i].name;
      pkg.PackageVersion = data[i].version;
      pkg.PackageSPDXIdentifier = data[i].purl;
      pkg.PackageDownloadLocation = data[i].url;
      pkg.description = `Detected by  ${AppConfig.APP_NAME}`;
      if (data[i].license_name !== undefined) pkg.ConcludedLicense = data[i].license_name;
      else pkg.licenseConcluded = 'n/a';
      spdx.Packages.push(pkg);
    }
    return JSON.stringify(spdx, undefined, 4);
  }

  private static template() {
    const spdx = {
      specVersion: 'SPDX-2.0',
      creationInfo: {
        creators: [`Tool: ${AppConfig.APP_NAME}`, `Organization: ${AppConfig.ORGANIZATION_URL}`],
        comment: 'This SPDX report has been automatically generated',
        licenseListVersion: '1.19',
        created: '',
      },
      spdxVersion: 'SPDX-2.0',
      dataLicense: 'CC0-1.0',
      id: 'SPDXRef-DOCUMENT',
      name: 'SPDX-Tools-v2.0',
      comment: `This document was automatically generated with ${AppConfig.APP_NAME}.`,
      externalDocumentRefs: [],
      Packages: [] as any,
    };
    return spdx;
  }
}
