import { ComponentDataLayer, DataProvider, IDataLayers } from 'scanoss';
import { modelProvider } from '../../../services/ModelProvider';
import { Config, transformData } from '../../../utils/TransformData';

// TODO: Finish this class to get the report work
export class IdentifiedLicenseDataProvider implements DataProvider {
  async getData(): Promise<IDataLayers> {
    return <IDataLayers>{
      licenses: null,
    };
  }

  public getLayerName(): string {
    return 'License Data Layer';
  }
}
