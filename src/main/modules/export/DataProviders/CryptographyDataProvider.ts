import { DataProvider, IDataLayers, CryptographyData } from 'scanoss';
import { BaseDataProvider } from './BaseDataProvider';
import { modelProvider } from '../../../services/ModelProvider';
import { ExportSource } from '../../../../api/types';
import { CryptographicItem } from '../../../model/entity/Cryptography';

export class CryptographyDataProvider extends BaseDataProvider implements DataProvider {
  private getCryptographyData(crypto: Array<CryptographicItem>):Array<CryptographyData> {
    const cryptographyData = [];
    crypto.forEach((c: CryptographicItem) => {
      cryptographyData.push({ ...c, source: c.name });
    });
    return cryptographyData;
  }

  public async getData(): Promise<IDataLayers> {
    let componentCryptography = null;
    let fileCryptography = null;
    if (this.source === ExportSource.DETECTED) {
      componentCryptography = await modelProvider.model.cryptography.findAllDetectedGroupByType();
      fileCryptography = await modelProvider.model.localCryptography.findAllDetectedGroupByType();
    } else {
      componentCryptography = await modelProvider.model.cryptography.findAllIdentifiedGroupByType();
      fileCryptography = await modelProvider.model.localCryptography.findAllIdentifiedGroupByType();
    }

    const localCrypto = await modelProvider.model.localCryptography.findAll();

    if (localCrypto.length <= 0 && componentCryptography.length <= 0) return <IDataLayers> { cryptography: null };

    return <IDataLayers> {
      cryptography: {
        files: this.getCryptographyData(fileCryptography),
        components: this.getCryptographyData(componentCryptography),
      },
    };
  }

  getLayerName(): string {
    return 'Cryptography Data Layer';
  }
}
