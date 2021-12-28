import * as os from 'os';
import { Buffer } from 'buffer';
import { utilModel } from '../../db/UtilModel';
import { Format } from '../Format';

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
      pkg.name = data[i].name;
      pkg.SPDXID = `SPDXRef-${crypto.createHash('md5').update(`${data[i].purl}@${data[i].version}`).digest('hex')}`; // md5 purl@version
      pkg.versionInfo = data[i].version;
      pkg.downloadLocation = data[i].url;
      pkg.filesAnalyzed = false;
      pkg.homePage = data[i].url;
      pkg.licenseDeclared = data[i].declareLicense;
      pkg.licenseConcluded = data[i].concludedLicense;
      pkg.externalRefs = [
        {
          referenceCategory: 'PACKAGE MANAGER',
          referenceLocator: data[i].purl,
          referenceType: 'purl',
        },
      ];
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
      creationInfo: {
        creators: ['Tool: SCANOSS Audit Workbench', `User: ${os.userInfo().username}`],
        created: utilModel.getTimeStamp(),
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
