import { ComponentDataLayer, DataProvider, IDataLayers } from 'scanoss';
import { ExportSource } from '../../../../api/types';
import { modelProvider } from '../../../services/ModelProvider';
import { BaseDataProvider } from './BaseDataProvider';
import { isValidPurl } from '../helpers/exportHelper';

export class ComponentDataProvider extends BaseDataProvider implements DataProvider {
  async getData(): Promise<IDataLayers> {
    const query = this.source === ExportSource.IDENTIFIED ? await modelProvider.model.component.getComponentsIdentifiedForReport() : await modelProvider.model.component.getComponentsDetectedForReport();
    const validComponents = query.filter((i) => isValidPurl(i.purl));

    const componentsMap: { [key: string]: ComponentDataLayer } = {};

    validComponents.forEach((item) => {
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

  public async getInvalidPurls(): Promise<Array<string> | null> {
    const query = this.source === ExportSource.IDENTIFIED
      ? await modelProvider.model.component.getComponentsIdentifiedForReport()
      : await modelProvider.model.component.getComponentsDetectedForReport();
    return query
      .filter((i) => !isValidPurl(i.purl))
      .map((i) => i.purl);
  }

  public getLayerName(): string {
    return 'Component Data Layer';
  }
}
