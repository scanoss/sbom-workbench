import { licenses } from '../model/licenses';
import { modelProvider } from './ModelProvider';
import {LicenseDTO, NewLicenseDTO} from "@api/dto";
import {License} from "@api/types";
import {licenseHelper} from "../helpers/LicenseHelper";

class LicenseService {

  public async getAll(): Promise<Array<LicenseDTO>> {
    return await modelProvider.model.license.getAll();
  }

  public async get(id: number): Promise<LicenseDTO> {
    return await modelProvider.model.license.get(id);
  }


  public async import() {
    await modelProvider.model.license.importFromJSON(licenses);
  }

  public async create(newLicense:NewLicenseDTO): Promise<LicenseDTO> {
    const lic = await modelProvider.model.license.create({ spdxid:licenseHelper.licenseNameToSPDXID(newLicense.name), ...newLicense });
    const license = await modelProvider.model.license.get(lic.id);
    return license;
  }
}

export const licenseService = new LicenseService();
