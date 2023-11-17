import { ComponentDataLayer, DataProvider, IDataLayers } from 'scanoss';
import { modelProvider } from '../../../services/ModelProvider';
import { Config, transformData } from '../../../utils/TransformData';

export class IdentifiedComponentDataProvider implements DataProvider {
  async getData(): Promise<IDataLayers> {
    const query = await modelProvider.model.component.getIdentifiedForReport();

    const config: Config = {
      key: 'purl',
      rename: 'key',
      properties: ['name', 'vendor', 'url'], // Direct properties of ComponentDataLayer
      child: {
        key: 'version',
        rename: 'versions',
        properties: ['version', 'license'], // Properties at the Version level
        additionalKeys: [
          {
            name: 'cryptography',
            properties: ['algorithm', 'strength'], // Properties at the Cryptography level
          },
        ],
      },
    };

    return <IDataLayers>{
      component: transformData(query, config) as unknown as ComponentDataLayer[],
    };
  }

  public getLayerName(): string {
    return 'Component Data Layer';
  }
}
