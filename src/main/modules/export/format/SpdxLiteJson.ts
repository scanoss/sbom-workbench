import * as os from 'os';
import { Buffer } from 'buffer';
import { utilModel } from '../../../model/UtilModel';
import { Format } from '../Format';
import { workspace } from '../../../workspace/Workspace';
import { ExportSource } from '../../../../api/types';

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
    const data =
      this.source === ExportSource.IDENTIFIED
        ? await this.export.getIdentifiedData()
        : await this.export.getDetectedData();
    const spdx = SpdxLiteJson.template();
    spdx.packages = [];
    spdx.documentDescribes = [];
    for (let i = 0; i < data.length; i += 1) {
      // Prevents create packages without license or versions, the standard not support that
      if (data[i].detected_license && data[i].version) {
        const aux = spdx.packages.find((p) =>
          p.versionInfo === data[i].version
            ? data[i].version
            : 'NOASSERTION' && p.externalRefs[0].referenceLocator === data[i].purl
        );
        if (aux !== undefined) {
          if (new RegExp(`\\b${data[i].detected_license}\\b`).test(aux.licenseDeclared) === false) {
            aux.licenseDeclared = aux.licenseDeclared.concat(' AND ', data[i].detected_license);
          }
        } else {
          const pkg = this.getPackage(data[i]);
          spdx.packages.push(pkg);
          spdx.documentDescribes.push(pkg.SPDXID);
        }
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
      name: 'SCANOSS-SBOM',
      documentNamespace: 'https://spdx.org/spdxdocs/DOCUMENTNAME-UUID',
      creationInfo: {
        creators: ['Tool: SCANOSS Audit Workbench', `Person: ${os.userInfo().username}`],
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

  private getPackage(data: any){
    const pkg: any = {};
    pkg.name = data.identified_component;
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
