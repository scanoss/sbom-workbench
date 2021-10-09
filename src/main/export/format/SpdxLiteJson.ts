import { utilDb } from '../../db/utils_db';
import { Format } from '../Format';

const pathLib = require('path');
const crypto = require('crypto');

export class SpdxLiteJson extends Format {
  constructor() {
    super();
    this.extension = '-SPDXLite.json';
  }

  // @override
  public async generate() {
    const data = await this.export.getSpdxData();
    const spdx = SpdxLiteJson.template();
    spdx.Packages = [];
    spdx.created = utilDb.getTimeStamp();
    for (let i = 0; i < data.length; i += 1) {
      const pkg: any = {};
      pkg.PackageName = data[i].name;
      pkg.PackageSPDXID = `${data[i].purl}@${data[i].version}`;
      pkg.PackageVersion = data[i].version;
      pkg.PackageDownloadLocation = data[i].url;
      pkg.ConcludedLicense = data[i].concludedLicense;
      pkg.DeclaredLicense = data[i].declareLicense;
      spdx.Packages.push(pkg);
    }

    const fileBuffer = JSON.stringify(spdx);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    const hex = hashSum.digest('hex');

    spdx.SPDXID = spdx.SPDXID.replace('###', hex);

    return JSON.stringify(spdx, undefined, 4);
  }

  private static template() {
    const spdx = {
      spdxVersion: 'SPDX-2.2',
      dataLicense: 'CC0-1.0',
      SPDXID: 'SCANOSS-SPDX-###',
      DocumentName: 'SCANOSS-SBOM',
      creator: 'Tool: SCANOSS Audit Workbench',
      created: '',
      Packages: [] as any,
    };
    return spdx;
  }
}
