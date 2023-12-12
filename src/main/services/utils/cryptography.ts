import { NewComponentDTO } from '@api/types';
import { cryptographyService } from '../CryptographyService';

export async function AddCrypto(data: NewComponentDTO | NewComponentDTO[]) {
  const components = Array.isArray(data) ? data : [data];
  await cryptographyService.importFromComponents(components);
}
