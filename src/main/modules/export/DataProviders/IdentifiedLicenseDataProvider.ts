import { DataProvider, IDataLayers, LicenseDataLayer } from 'scanoss';
import { modelProvider } from '../../../services/ModelProvider';

export class IdentifiedLicenseDataProvider implements DataProvider {
  async getData(): Promise<IDataLayers> {
    const licenses = [] as unknown as Array<LicenseDataLayer>;
    const query = await modelProvider.model.component.getIdentifiedForReport();

    // First pass: Group by license
    query.forEach((element) => {
      const licenseIndex = licenses.findIndex((obj) => obj.label === element.spdxid);

      if (licenseIndex >= 0) {
        licenses[licenseIndex].components.push({
          name: element.comp_name,
          vendor: element.vendor,
          url: element.url,
          purl: element.purl,
          versions: [element.version], // Initially, only one element in the array
        });
        licenses[licenseIndex].value += 1;
      } else {
        licenses.push({
          label: element.spdxid,
          value: 1,
          components: [
            {
              name: element.comp_name,
              vendor: element.vendor,
              url: element.url,
              purl: element.purl,
              versions: [element.version],
            },
          ],
        });
      }
    });

    // Second pass: Group versions for components with the same purl, vendor, and name
    licenses.forEach((license) => {
      const combinedComponents = [];

      license.components.forEach((component) => {
        const existingComponentIndex = combinedComponents.findIndex(
          (comp) => comp.purl === component.purl && comp.vendor === component.vendor && comp.name === component.name
        );

        if (existingComponentIndex >= 0) {
          combinedComponents[existingComponentIndex].versions.push(...component.versions);
        } else {
          combinedComponents.push(component);
        }
      });

      combinedComponents.forEach((comp) => {
        comp.versions = [...new Set(comp.versions)];
      });

      license.components = combinedComponents;
    });
    return <IDataLayers>{ licenses };
  }

  public getLayerName(): string {
    return 'License Data Layer';
  }
}
