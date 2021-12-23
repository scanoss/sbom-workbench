import * as os from 'os';
import { Buffer } from 'buffer';
import { utilDb } from '../../db/utils_db';
import { Format } from '../Format';

const pathLib = require('path');
const crypto = require('crypto');

export enum LicenseType {
  OFFICIAL = 1,
  CUSTOM = 0,
}

export class SpdxLiteJson extends Format {
  constructor() {
    super();
    this.extension = '-SPDXLite.json';
  }

  // @override
  public async generate() {
    const data = await this.export.getSpdxData();
    const spdx = SpdxLiteJson.template();
    spdx.packages = [];
    for (let i = 0; i < data.length; i += 1) {
      const pkg: any = {};
      pkg.PackageName = data[i].name;
      pkg.PackageSPDXID = `${data[i].purl}@${data[i].version}`;
      pkg.PackageVersion = data[i].version;
      pkg.PackageDownloadLocation = data[i].url;
      pkg.ConcludedLicense = data[i].concludedLicense;
      pkg.DeclaredLicense = data[i].declareLicense;
      if (data[i].official === LicenseType.CUSTOM) pkg.ExtractedText = this.fulltextToBase64(data[i].fulltext);

      spdx.packages.push(pkg);
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
      SPDXID: 'SPDXRef-###',
      name: 'SCANOSS-SBOM',
      creationInfo:{
        creators: ['Tool: SCANOSS Audit Workbench', `User: ${os.userInfo().username}`],
      created: utilDb.getTimeStamp(),
      },
      packages: [] as any,
    };
    return spdx;
  }

  private fulltextToBase64(fulltext: string) {
    const buf = Buffer.from(fulltext);
    return buf.toString('base64');
  }
}
