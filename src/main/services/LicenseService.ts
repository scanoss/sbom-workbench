import { modelProvider } from './ModelProvider';

class LicenseService {
  public async importFromJSON(licenses: Array<any>) {
    await modelProvider.model.license.importFromJSON(licenses);
  }
}

export const licenseService = new LicenseService();
