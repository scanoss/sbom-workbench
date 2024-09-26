import * as CDX from '@cyclonedx/cyclonedx-library';
import { PackageURL } from 'packageurl-js';
import { ExportSource } from '../../../../../api/types';
import { Format } from '../../Format';
import { Project } from '../../../../workspace/Project';
import { ExportComponentData } from '../../../../model/interfaces/report/ExportComponentData';
import { ExportRepository } from '../../Repository/ExportRepository';

export abstract class CycloneDX extends Format {
  private source: string;

  private project: Project;

  constructor(source: string, project: Project, exportModel: ExportRepository) {
    super(exportModel);
    this.source = source;
    this.extension = '.bom';
    this.project = project;
  }

  protected abstract getUniqueComponents(data: Array<ExportComponentData>): Array<ExportComponentData>;

  // See CycloneDX 1.6 https://cyclonedx.org/docs/1.6/json
  // See CycloneDX Example w/ Crypto & Dependencies https://raw.githubusercontent.com/CycloneDX/bom-examples/master/CBOM/Example-With-Dependencies/bom.json
  public async generate() {
    // Create CycloneDX Header
    const bom = new CDX.Models.Bom();
    bom.metadata.component = new CDX.Models.Component(
      CDX.Enums.ComponentType.Application,
      this.project.project_name,
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

    const components = this.getUniqueComponents(data);

    // Add components to CycloneDX with each respective license
    components.forEach((c) => {
      const licenseRepository = new CDX.Models.LicenseRepository();
      if (c.unique_detected_licenses.length > 0) {
        c.unique_detected_licenses.forEach((dl) => {
          licenseRepository.add(new CDX.Models.SpdxLicense(dl, { acknowledgement: CDX.Enums.LicenseAcknowledgement.Declared }));
        });
      }

      if (c.unique_concluded_licenses.length > 0) {
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
          purl: PackageURL.fromString(c.purl.replace('@', '%40')),
          version: c.version,
          licenses: licenseRepository,
          externalReferences: externalReferenceRepository,
        },
      );

      bom.components.add(cdxComponent);
    });

    const jsonSerializer = new CDX.Serialize.JsonSerializer(
      new CDX.Serialize.JSON.Normalize.Factory(CDX.Spec.Spec1dot6),
    );

    return jsonSerializer.serialize(bom, { sortLists: true, space: 2 });
  }
}
