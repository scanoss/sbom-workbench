import { utilDb } from '../../db/utils_db';
import { Format } from '../Format';

export class SpdxLiteJson extends Format {
  constructor() {
    super();
    this.extension = '.SPDXLite.json';
  }

  // @override
  public async generate() {
    const data = await this.export.getSpdxData();
    const spdx = SpdxLiteJson.template();
    spdx.Packages = [];
    spdx.creationInfo.created = utilDb.getTimeStamp();
    for (let i = 0; i < data.length; i += 1) {
      const pkg: any = {};
      pkg.PackageName = data[i].name;
      pkg.PackageVersion = data[i].version;
      pkg.PackageFileName = '-';
      pkg.PackageDownloadLocation = data[i].purl;
      pkg.FilesAnalyzed = false;
      pkg.PackageHomePage = data[i].url;
      pkg.ConcludedLicense = data[i].license_name !== undefined ? data[i].license_name : data[i].license_name;
      pkg.PackageLicenseInfoFromFiles = data[i].license_name;
      pkg.DeclaredLicense = data[i].declareLicense;
      pkg.CommentsonLicense = data[i].notes !== 'n/a' ? data[i].notes : '-';
      pkg.CopyrightText = '-';
      spdx.Packages.push(pkg);
    }
    return JSON.stringify(spdx, undefined, 4);
  }

  private static template() {
    const spdx = {
      specVersion: 'SPDX-Lite',
      creationInfo: {
        creators: ['Tool: SCANOSS Inventory Engine', 'Organization: http://scanoss.com'],
        comment: 'This SPDX report has been automatically generated',
        licenseListVersion: '1.19',
        created: '',
      },
      spdxVersion: 'SPDX-Lite',
      dataLicense: 'CC0-1.0',
      id: 'SPDXRef-DOCUMENT',
      name: 'SPDX-Tools-Lite',
      comment: 'This document was automatically generated with SCANOSS.',
      externalDocumentRefs: [],
      Packages: [] as any,
    };
    return spdx;
  }
}
