import * as CDX from '@cyclonedx/cyclonedx-library';
import { PackageURL } from 'packageurl-js';
import AppConfig from '../../../../../config/AppConfigModule';
import { ExportSource, ExportStatusCode } from '../../../../../api/types';
import { ExportResult, Format } from '../../Format';
import { Project } from '../../../../workspace/Project';
import { ExportComponentData } from '../../../../model/interfaces/report/ExportComponentData';
import { ExportRepository } from '../../Repository/ExportRepository';
import { getSupplier, resolveVulnerabilityURL, toVulnerabilityExportData } from '../../helpers/exportHelper';
import { ReportData } from '../../ReportData';

export abstract class CycloneDX extends Format {
  private source: string;

  private project: Project;

  constructor(source: string, project: Project, exportModel: ExportRepository) {
    super(exportModel);
    this.source = source;
    this.extension = '.bom';
    this.project = project;
  }

  protected abstract getUniqueComponents(data: Array<ExportComponentData>): ReportData<ExportComponentData[]>;

  // See CycloneDX 1.6 https://cyclonedx.org/docs/1.6/json
  // See CycloneDX Example w/ Crypto & Dependencies https://raw.githubusercontent.com/CycloneDX/bom-examples/master/CBOM/Example-With-Dependencies/bom.json
  public async generate(): Promise<ExportResult> {
    // Create CycloneDX Header
    const bom = new CDX.Models.Bom();
    bom.metadata = new CDX.Models.Metadata({
      authors: new CDX.Models.OrganizationalContactRepository([
        new CDX.Models.OrganizationalContact({
          name: AppConfig.ORGANIZATION_NAME,
          email: AppConfig.ORGANIZATION_EMAIL,
        }),
      ]),
      timestamp: new Date(),
    });
    bom.metadata.component = new CDX.Models.Component(
      CDX.Enums.ComponentType.Application,
      this.project.metadata.getName(),
      { version: 'NOASSERTION',
      },
    );

    if (this.project.metadata.getLicense()) {
      bom.metadata.licenses.add(
        new CDX.Models.SpdxLicense(
          this.project.metadata.getLicense(),
        ),
      );
    }

    const data = this.source === ExportSource.IDENTIFIED
      ? await this.export.getIdentifiedData()
      : await this.export.getDetectedData();

    const vulnerabilityData = this.source === ExportSource.IDENTIFIED
      ? await this.export.getIdentifiedVulnerability()
      : await this.export.getDetectedVulnerability();

    const { components, invalidPurls } = this.getUniqueComponents(data);

    const vulnerabilityExportData = toVulnerabilityExportData(vulnerabilityData);

    // Add components to CycloneDX with each respective license
    components.forEach((c) => {
      const licenseRepository = new CDX.Models.LicenseRepository();
      if (c.unique_detected_licenses?.length > 0) {
        c.unique_detected_licenses.forEach((dl) => {
          licenseRepository.add(new CDX.Models.SpdxLicense(dl, { acknowledgement: CDX.Enums.LicenseAcknowledgement.Declared }));
        });
      }

      if (c.unique_concluded_licenses?.length > 0) {
        c.unique_concluded_licenses.forEach((il) => {
          licenseRepository.add(new CDX.Models.SpdxLicense(il, { acknowledgement: CDX.Enums.LicenseAcknowledgement.Concluded }));
        });
      }

      const externalReferenceRepository = new CDX.Models.ExternalReferenceRepository();
      if (c.url) {
        externalReferenceRepository.add(new CDX.Models.ExternalReference(c.url, CDX.Enums.ExternalReferenceType.Website));
      }

      const cdxComponent = new CDX.Models.Component(
        CDX.Enums.ComponentType.Library,
        c.purl,
        {
          publisher: getSupplier(c),
          purl: PackageURL.fromString(c.purl.replace('@', '%40')),
          version: c.version,
          licenses: licenseRepository,
          externalReferences: externalReferenceRepository,
        },
      );

      bom.components.add(cdxComponent);
    });

    vulnerabilityExportData.forEach((v) => {
      const ratingRepository = new CDX.Models.Vulnerability.RatingRepository();
      if(v.severity)
        ratingRepository.add(new CDX.Models.Vulnerability.Rating({ severity: v.severity.toLowerCase() as any }));
      const affectedRepository = new CDX.Models.Vulnerability.AffectRepository();
      v.affectedComponents.forEach((c:any) => {
        const bomRef = new CDX.Models.BomRef(c.purl);
        const versions = [];
        c.versions.forEach((v:string) => {
          versions.push(new CDX.Models.Vulnerability.AffectedSingleVersion(v));
        });
        const affect = new CDX.Models.Vulnerability.Affect(bomRef, {
          versions: new CDX.Models.Vulnerability.AffectedVersionRepository(versions),
        });
        // Create the affected repository
        affectedRepository.add(affect);
      });

      const vulnerability = new CDX.Models.Vulnerability.Vulnerability({
        id: v.cve,
        description: v.summary,
        source: new CDX.Models.Vulnerability.Source({
          name: v.source,
          url: resolveVulnerabilityURL(v.source, v.cve),
        }),
        published: new Date(v.published),
        updated: new Date(v.modified),
        ratings: ratingRepository,
        affects: affectedRepository,
      });
      bom.vulnerabilities.add(vulnerability);
    });

    const jsonSerializer = new CDX.Serialize.JsonSerializer(
      new CDX.Serialize.JSON.Normalize.Factory(CDX.Spec.Spec1dot6),
    );

    return {
      report: jsonSerializer.serialize(bom, { sortLists: true, space: 2 }),
      status: {
        code: invalidPurls.length > 0 ? ExportStatusCode.SUCCESS_WITH_WARNINGS : ExportStatusCode.SUCCESS,
        info: {
          invalidPurls,
        },
      },
    };
  }
}
