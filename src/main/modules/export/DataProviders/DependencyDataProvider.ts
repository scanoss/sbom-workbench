import { DataProvider, Dependency, IDataLayers } from 'scanoss';
import { modelProvider } from '../../../services/ModelProvider';
import { BaseDataProvider } from './BaseDataProvider';
import { ExportSource } from '../../../../api/types';

export class DependencyDataProvider extends BaseDataProvider implements DataProvider {
  async getData(): Promise<IDataLayers> {
    const query = this.source === ExportSource.IDENTIFIED ? await modelProvider.model.dependency.getIdentifiedDependencies() : await modelProvider.model.dependency.getDetectedDependencies();
    if (!query.length) return { dependencies: null } as IDataLayers;

    const fileMap: { [file: string]: Dependency[] } = {};

    query.forEach((item) => {
      if (!fileMap[item.file]) {
        fileMap[item.file] = [];
      }

      const licenses = item.licenses ? item.licenses.split(',').map((license) => ({ name: license.trim(), spdxid: license.trim() })) : [{ name: 'unknown', spdxid: 'unknown' }];

      fileMap[item.file].push({
        purl: item.purl,
        component: item.component,
        version: item.version,
        url: item.url,
        licenses,
      });
    });

    const results = <IDataLayers>{
      dependencies: Object.keys(fileMap).map((file) => ({
        file,
        dependencies: fileMap[file],
      })),
    };
    return results;
  }

  getLayerName(): string {
    return 'Dependency layer';
  }
}
