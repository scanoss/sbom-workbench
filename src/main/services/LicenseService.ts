import { LicenseDTO, NewLicenseDTO } from '@api/dto';
import { HttpClient } from 'scanoss';
import log from 'electron-log';
import { licenses } from '../../../assets/data/licenses';
import { modelProvider } from './ModelProvider';
import { licenseHelper } from '../helpers/LicenseHelper';
import { getHttpConfig } from './utils/httpUtil';
import { userSettingService } from './UserSettingService';
import { workspace } from '../workspace/Workspace';
import { LicenseObligation } from '../../api/types';

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

  public async getLicenseObligations(spdxid: string): Promise<LicenseObligation> {
    const project = workspace.getOpenedProjects()[0];
    const {
      DEFAULT_API_INDEX,
      APIS,
    } = userSettingService.get();

    const scanossHttp = new HttpClient(getHttpConfig());

    const URL = project.getApi() ? project.getApi() : APIS[DEFAULT_API_INDEX].URL;

    const obligationURL = `${URL}/license/obligations/${spdxid}`;

    const response = await scanossHttp.get(obligationURL);

    if (!response.ok) {
      log.error('[ License obligations ]', response.statusText);
      throw new Error(response.statusText);
    }

    return response.json();
  }
}

export const licenseService = new LicenseService();
