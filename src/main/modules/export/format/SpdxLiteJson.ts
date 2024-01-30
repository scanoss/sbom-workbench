import * as os from 'os';
import { Buffer } from 'buffer';
import { utilModel } from '../../../model/UtilModel';
import { Format } from '../Format';
import { workspace } from '../../../workspace/Workspace';
import { ExportSource } from '../../../../api/types';
import AppConfig from '../../../../config/AppConfigModule';

const crypto = require('crypto');

export enum LicenseType {
  OFFICIAL = 1,
  CUSTOM = 0,
}

export class SpdxLiteJson extends Format {
  private source: string;

  constructor(source: string) {
    super();
    this.source = source;
    this.extension = '-SPDXLite.json';
  }

  // @override
  public async generate() {
    const data = this.source === ExportSource.IDENTIFIED
      ? await this.export.getIdentifiedData()
      : await this.export.getDetectedData();
    const spdx = SpdxLiteJson.template();
    spdx.packages = [];
    spdx.documentDescribes = [];

    for (let i = 0; i < data.length; i += 1) {
      // Find already existing package by purl and version
      const pkg = spdx.packages.find((p) => (p.versionInfo === (data[i].version || 'NOASSERTION') && (p.externalRefs[0].referenceLocator === data[i].purl)));

      if (pkg && data[i].detected_license) {
        if (new RegExp(`\\b${data[i].detected_license}\\b`).test(pkg.licenseDeclared) === false) {
          pkg.licenseDeclared = pkg.licenseDeclared === 'NOASSERTION'
            ? pkg.licenseDeclared.replace('NOASSERTION', data[i].detected_license) // Not concat when NOASSERTION exists
            : pkg.licenseDeclared.concat(' AND ', data[i].detected_license);
        }
      } else {
        // eslint-disable-next-line no-continue
        if (pkg && !data[i].detected_license) continue;

        const newPackage = this.getPackage(data[i]);
        spdx.packages.push(newPackage);
        spdx.documentDescribes.push(newPackage.SPDXID);
      }
    }

    const fileBuffer = JSON.stringify(spdx);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    const hex = hashSum.digest('hex');

    spdx.SPDXID = spdx.SPDXID.replace('###', hex);
    // Add DocumentNameSpace
    const p = workspace.getOpenProject();
    let projectName = p.getProjectName();
    projectName = projectName.replace(/\s/g, '');
    spdx.documentNamespace = spdx.documentNamespace.replace('DOCUMENTNAME', projectName);
    spdx.documentNamespace = spdx.documentNamespace.replace('UUID', hex);

    return JSON.stringify(spdx, undefined, 4);
  }

  private static template() {
    const spdx = {
      spdxVersion: 'SPDX-2.2',
      dataLicense: 'CC0-1.0',
      SPDXID: 'SPDXRef-###',
      name: 'SBOM',
      documentNamespace: 'https://spdx.org/spdxdocs/DOCUMENTNAME-UUID',
      creationInfo: {
        creators: [`Tool: ${AppConfig.APP_NAME}`, `Person: ${os.userInfo().username}`],
        created: utilModel.getTimeStamp(),
      },
      packages: [] as any,
      documentDescribes: [] as any,
    };
    return spdx;
  }

  private fulltextToBase64(fulltext: string) {
    const buf = Buffer.from(fulltext);
    return buf.toString('base64');
  }

  private getPackage(data: any) {
    const pkg: any = {};
    pkg.name = data.identified_component !== '' ? data.identified_component : data.purl;
    pkg.SPDXID = `SPDXRef-${crypto.createHash('md5').update(`${data.purl}@${data.version}`).digest('hex')}`; // md5 purl@version
    pkg.versionInfo = data.version ? data.version : 'NOASSERTION';
    pkg.downloadLocation = data.url ? data.url : 'NOASSERTION';
    pkg.filesAnalyzed = false;
    pkg.homepage = data.url || 'NOASSERTION';
    pkg.licenseDeclared = data.detected_license ? data.detected_license : 'NOASSERTION';
    pkg.licenseConcluded = this.source === ExportSource.DETECTED ? 'NOASSERTION' : data.identified_license;
    if (data.official === LicenseType.CUSTOM) {
      pkg.copyrightText = this.fulltextToBase64(data.fulltext);
    } else {
      pkg.copyrightText = 'NOASSERTION';
    }
    pkg.externalRefs = [
      {
        referenceCategory: 'PACKAGE_MANAGER',
        referenceLocator: data.purl,
        referenceType: 'purl',
      },
    ];
    return pkg;
  }
}
