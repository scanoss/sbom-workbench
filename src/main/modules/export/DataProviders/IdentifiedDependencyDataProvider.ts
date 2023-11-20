import { DataProvider, IDataLayers, DependencyDataLayer, Dependency } from 'scanoss';
import { modelProvider } from '../../../services/ModelProvider';
export class IdentifiedDependencyDataProvider implements DataProvider {
  async getData(): Promise<IDataLayers> {
    const query = await modelProvider.model.dependency.getIdentifiedDependencies();

    const fileMap: { [file: string]: Dependency[] } = {};

    query.forEach((item) => {
      if (!fileMap[item.file]) {
        fileMap[item.file] = [];
      }

      const licenses = item.licenses.split(',').map((license) => {
        return { name: license.trim(), spdxid: license.trim() };
      });

      fileMap[item.file].push({
        purl: item.purl,
        component: item.component,
        version: item.version,
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
