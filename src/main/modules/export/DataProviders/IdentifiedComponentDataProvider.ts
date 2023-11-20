import { ComponentDataLayer, DataProvider, IDataLayers } from 'scanoss';
import { modelProvider } from '../../../services/ModelProvider';

export class IdentifiedComponentDataProvider implements DataProvider {
  async getData(): Promise<IDataLayers> {
    const query = await modelProvider.model.component.getComponentsIdentifiedForReport();
    const componentsMap: { [key: string]: ComponentDataLayer } = {};

    query.forEach((item) => {
      const key = item.purl; // Assuming purl[0] is used as the key

      if (!componentsMap[key]) {
        componentsMap[key] = {
          key,
          purls: [],
          name: item.name,
          vendor: item.vendor,
          url: item.url,
          versions: [],
          health: null, // Layer not available on Identified Stage
        };
      }

      const versionIndex = componentsMap[key].versions.findIndex((v) => v.version === item.version);
      if (versionIndex >= 0) {
        const version = componentsMap[key].versions[versionIndex];
        if (!version.licenses.includes(item.spdxid)) {
          version.licenses.push(item.spdxid);
        }
        if (item.algorithms) {
          if (!version.cryptography) version.cryptography = [];
          version.cryptography.push(...item.algorithms);
        }
      } else {
        componentsMap[key].versions.push({
          version: item.version,
          licenses: [item.license],
          cryptography: item.algorithms ? item.algorithms : null,
          copyrights: null,
          quality: null,
        });
      }

      if (!componentsMap[key].purls.includes(item.purl)) {
        componentsMap[key].purls.push(item.purl);
      }
    });

    return <IDataLayers>{
      component: Object.values(componentsMap) as unknown as ComponentDataLayer[],
    };
  }

  public getLayerName(): string {
    return 'Component Data Layer';
  }
}
