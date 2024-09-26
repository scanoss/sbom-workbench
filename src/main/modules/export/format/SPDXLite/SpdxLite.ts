import * as os from 'os';
import { Buffer } from 'buffer';
import { utilModel } from '../../../../model/UtilModel';
import { Format } from '../../Format';
import { workspace } from '../../../../workspace/Workspace';
import { ExportSource } from '../../../../../api/types';
import AppConfig from '../../../../../config/AppConfigModule';
import { modelProvider } from '../../../../services/ModelProvider';
import { ExportComponentData } from '../../../../model/interfaces/report/ExportComponentData';

const crypto = require('crypto');

export enum LicenseType {
  OFFICIAL = 1,
  CUSTOM = 0,
}

export abstract class SpdxLite extends Format {
  private source: string;

  protected licenseMapper: Map<string, any>;

  constructor(source: string) {
    super();
    this.source = source;
    this.extension = '-SPDXLite.json';
  }

  protected abstract getUniqueComponents(data: Array<ExportComponentData>): Array<ExportComponentData>;

  protected abstract getLicenseCopyRight(component: ExportComponentData);

  // @override
  public async generate() {
    const licenses = await modelProvider.model.license.getAllWithFullText();
    this.licenseMapper = new Map<string, any>();
    licenses.forEach((l) => {
      this.licenseMapper.set(l.spdxid, l);
    });

    const data = this.source === ExportSource.IDENTIFIED
      ? await this.export.getIdentifiedData()
      : await this.export.getDetectedData();

    const components = this.getUniqueComponents(data);

    const spdx = SpdxLite.template();
    spdx.packages = [];
    spdx.documentDescribes = [];
    components.forEach((c) => {
      const newPackage = this.getPackage(c);
      spdx.packages.push(newPackage);
      spdx.documentDescribes.push(newPackage.SPDXID);
    });

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

  protected fulltextToBase64(fulltext: string) {
    const buf = Buffer.from(fulltext);
    return buf.toString('base64');
  }

  // @Override
  private getPackage(component: ExportComponentData) {
    const pkg: any = {};
    pkg.name = component.purl;
    pkg.SPDXID = `SPDXRef-${crypto.createHash('md5').update(`${component.purl}@${component.version}`).digest('hex')}`; // md5 purl@version
    pkg.versionInfo = component.version ? component.version : 'NOASSERTION';
    pkg.downloadLocation = component.url ? component.url : 'NOASSERTION';
    pkg.filesAnalyzed = false;
    pkg.homepage = component.url || 'NOASSERTION';
    pkg.licenseDeclared = component.detected_licenses ? component.detected_licenses : 'NOASSERTION';
    pkg.licenseConcluded = component.concluded_licenses;
    pkg.copyrightText = this.getLicenseCopyRight(component);
    pkg.externalRefs = [
      {
        referenceCategory: 'PACKAGE_MANAGER',
        referenceLocator: component.purl,
        referenceType: 'purl',
      },
    ];
    return pkg;
  }
}
