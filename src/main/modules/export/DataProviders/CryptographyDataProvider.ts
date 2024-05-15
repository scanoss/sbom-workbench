import { DataProvider, IDataLayers } from 'scanoss';
import { BaseDataProvider } from './BaseDataProvider';
import { modelProvider } from '../../../services/ModelProvider';
import { ExportSource } from '../../../../api/types';

export class CryptographyDataProvider extends BaseDataProvider implements DataProvider {
  public async getData(): Promise<IDataLayers> {
    let componentCryptography = null;
    if (this.source === ExportSource.DETECTED) {
      componentCryptography = await modelProvider.model.cryptography.findAllDetected();
    } else {
      componentCryptography = await modelProvider.model.cryptography.findAllIdentifiedMatched();
    }

    const localCrypto = await modelProvider.model.localCryptography.findAll();

    if (localCrypto.length <= 0 && componentCryptography.length <= 0) return <IDataLayers> { cryptography: null };

    return <IDataLayers> {
      cryptography: {
        files: localCrypto,
        components: componentCryptography,
      },
    };
  }

  getLayerName(): string {
    return 'Cryptography Data Layer';
  }
}
