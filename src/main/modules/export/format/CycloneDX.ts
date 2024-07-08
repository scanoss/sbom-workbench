import * as CDX from '@cyclonedx/cyclonedx-library';
import { PackageURL } from 'packageurl-js';
import { ExportSource, FileUsageType } from '../../../../api/types';
import { Format } from '../Format';
import { ExportData, ExportModel } from '../Model/ExportModel';
import { Project } from '../../../workspace/Project';

export class CycloneDX extends Format {
  private source: string;

  private project: Project;

  constructor(source: string, project: Project, exportModel: ExportModel) {
    super(exportModel);
    this.source = source;
    this.extension = '.bom';
    this.project = project;
  }

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

    let sbomWorkbenchComponents = this.source === ExportSource.IDENTIFIED
      ? await this.export.getIdentifiedData()
      : await this.export.getDetectedData();

    // Remove duplicated components, this is because the query returns multiple rows with the same purl & version.
    // TODO: Create a specific query to get DISTINCT purls, versions & licenses
    const compRepository = new Map<string, ExportData>();
    sbomWorkbenchComponents.forEach((comp) => {
      compRepository.set(`${comp.purl}@${comp.version}`, comp);
    });

    sbomWorkbenchComponents = Array.from(compRepository.values());

    // Add components to CycloneDX with each respective license
    sbomWorkbenchComponents.forEach((storedComponent) => {
      const licenseRepository = new CDX.Models.LicenseRepository();
      if (storedComponent.detected_license) {
        licenseRepository.add(new CDX.Models.SpdxLicense(storedComponent.detected_license, { acknowledgement: CDX.Enums.LicenseAcknowledgement.Declared }));
      }
      if (this.source === ExportSource.IDENTIFIED && storedComponent.identified_license) {
        licenseRepository.add(new CDX.Models.SpdxLicense(storedComponent.identified_license, { acknowledgement: CDX.Enums.LicenseAcknowledgement.Concluded }));
      }

      const externalReferenceRepository = new CDX.Models.ExternalReferenceRepository();
      if (storedComponent.url) {
        externalReferenceRepository.add(new CDX.Models.ExternalReference(storedComponent.url, CDX.Enums.ExternalReferenceType.Website));
      }

      const cdxComponent = new CDX.Models.Component(
        CDX.Enums.ComponentType.Library,
        this.source === ExportSource.IDENTIFIED ? storedComponent.identified_component : storedComponent.detected_component,
        {
          purl: PackageURL.fromString(storedComponent.purl.replace('@', '%40')),
          version: storedComponent.version,
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
