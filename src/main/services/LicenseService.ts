import { LicenseDTO, NewLicenseDTO } from '@api/dto';
import { licenses } from '../../../assets/data/licenses';
import { modelProvider } from './ModelProvider';
import { licenseHelper } from '../helpers/LicenseHelper';

class LicenseService {
  public async getAll(): Promise<Array<LicenseDTO>> {
    const licenses = await modelProvider.model.license.getAll();
    return licenses;
  }

  public async get(id: number): Promise<LicenseDTO> {
    const license = await modelProvider.model.license.get(id);
    return license;
  }

  public async import() {
    await modelProvider.model.license.importFromJSON(licenses);
  }

  public async create(newLicense: NewLicenseDTO): Promise<LicenseDTO> {
    const lic = await modelProvider.model.license.create({
      spdxid: licenseHelper.licenseNameToSPDXID(newLicense.name),
      ...newLicense,
    });
    const license = await modelProvider.model.license.get(lic.id);
    return license;
  }
}

export const licenseService = new LicenseService();
