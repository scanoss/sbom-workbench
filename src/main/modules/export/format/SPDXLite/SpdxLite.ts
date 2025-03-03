import * as os from 'os';
import { Buffer } from 'buffer';
import { app } from 'electron';
import { PackageURL } from 'packageurl-js';
import { utilModel } from '../../../../model/UtilModel';
import { Format } from '../../Format';
import { ExportSource } from '../../../../../api/types';
import AppConfig from '../../../../../config/AppConfigModule';
import { ExportComponentData } from '../../../../model/interfaces/report/ExportComponentData';
import packageJson from '../../../../../../release/app/package.json';
import { getSPDXLicenseInfos } from '../../helpers/exportHelper';
import { Project } from '../../../../workspace/Project';
import { ExportRepository } from '../../Repository/ExportRepository';

const crypto = require('crypto');

export enum LicenseType {
  OFFICIAL = 1,
  CUSTOM = 0,
}

export abstract class SpdxLite extends Format {
  private source: string;

  protected licenseMapper: Map<string, any>;

  protected project:Project;

  constructor(source: string, project: Project, exportModel: ExportRepository) {
    super();
    this.source = source;
    this.extension = '-SPDXLite.json';
    this.export = exportModel;
    this.project = project;
  }

  protected abstract getUniqueComponents(data: Array<ExportComponentData>): Array<ExportComponentData>;

  protected abstract getLicenseCopyRight(component: ExportComponentData);

  // @override
  public async generate() {
    const licenses = await this.export.getAllLicensesWithFullText();
    this.licenseMapper = new Map<string, any>();
    licenses.forEach((l) => {
      this.licenseMapper.set(l.spdxid, l);
    });

    const data = this.source === ExportSource.IDENTIFIED
      ? await this.export.getIdentifiedData()
      : await this.export.getDetectedData();

    const components = this.getUniqueComponents(data);

    const spdx = this.template();
    spdx.packages = [];
    spdx.documentDescribes = [];

    const uniqueLicensesInfos = new Set<string>();
    components.forEach((c) => {
      const newPackage = this.getPackage(c);
      spdx.packages.push(newPackage);
      spdx.documentDescribes.push(newPackage.SPDXID);

      // Fill extracted licensing infos with unique LicenseRef identifiers
      spdx.hasExtractedLicensingInfos.push(...getSPDXLicenseInfos(c.detected_licenses, uniqueLicensesInfos));

      // Only add licensing info from concluded licenses when export source is IDENTIFIED
      if (this.source === ExportSource.IDENTIFIED) {
        spdx.hasExtractedLicensingInfos.push(...getSPDXLicenseInfos(c.concluded_licenses, uniqueLicensesInfos));
      }
    });

    const fileBuffer = JSON.stringify(spdx);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    const hex = hashSum.digest('hex');
    // Add DocumentNameSpace
    let projectName = this.project.getProjectName();
    projectName = projectName.replace(/\s/g, '');
    spdx.documentNamespace = spdx.documentNamespace.replace('DOCUMENTNAME', projectName);
    spdx.documentNamespace = spdx.documentNamespace.replace('UUID', hex);

    return JSON.stringify(spdx, undefined, 4);
  }

  private template(): SPDXDocument {
    const spdx = {
      spdxVersion: 'SPDX-2.2',
      dataLicense: 'CC0-1.0',
      SPDXID: 'SPDXRef-DOCUMENT',
      name: `SBOM for ${this.project.getProjectName()}`,
      documentNamespace: 'https://spdx.org/spdxdocs/DOCUMENTNAME-UUID',
      creationInfo: {
        creators: [
          `Tool: ${AppConfig.APP_NAME}-${app.isPackaged ? app.getVersion() : packageJson.version}`,
          `Person: ${os.userInfo().username}`,
          'Organization: SCANOSS',
        ],
        created: utilModel.getTimeStamp(),
        comment: 'SBOM Build information - SBOM Type: Build',
      },
      packages: [] as any,
      documentDescribes: [],
      hasExtractedLicensingInfos: [],
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
    pkg.downloadLocation = component.download_url || component.url || 'NOASSERTION';
    pkg.filesAnalyzed = false;
    pkg.supplier = `Organization: ${component.vendor ? component.vendor : (PackageURL.fromString(component.purl).namespace || 'NOASSERTION')}`;
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
    pkg.checksums = [
      {
        algorithm: 'MD5',
        // Set MD5 hash for those components without url hash
        checksumValue: component.url_hash || '0'.repeat(32),
      },
    ];
    return pkg;
  }
}
