import { LicenseDTO, NewLicenseDTO } from '@api/dto';
import { HttpClient } from 'scanoss';
import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import { licenses } from '../../../assets/data/licenses';
import { modelProvider } from './ModelProvider';
import { licenseHelper } from '../helpers/LicenseHelper';
import { getHttpConfig } from './utils/httpUtil';
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

    const defaultLicenses = await modelProvider.model.license.getAll();
    const defaultLicensesSPDXs = new Set(defaultLicenses.map((l) => l.spdxid));
    const isDev = process.env.NODE_ENV !== 'production';
    const spdxLicensesPath = isDev
      ? path.join(__dirname, '../../../assets/data/licenses-spdx.json')
      : path.join(__dirname, '../../../assets/data/licenses-spdx.json');
    const spdxLicenses = await fs.promises.readFile(spdxLicensesPath, 'utf8');

    const newLicenses = [];
    const spdxLicensesParsed = JSON.parse(spdxLicenses);
    spdxLicensesParsed.licenses.forEach((l) => {
      if (!defaultLicensesSPDXs.has(l.licenseId)) {
        newLicenses.push({
          fulltext: 'AUTOMATIC IMPORT',
          name: l.name,
          spdxid: l.licenseId,
          url: l.reference,
        });
      }
    });
    await modelProvider.model.license.importFromJSON(newLicenses);
  }

  public async create(newLicense: NewLicenseDTO): Promise<LicenseDTO> {
    const lic = await modelProvider.model.license.create({
      spdxid: licenseHelper.licenseNameToSPDXID(newLicense.name),
      ...newLicense,
    });
    const license = await modelProvider.model.license.get(lic.id);
    return license;
  }

  // TODO: Move this call to scanoss.js SDK
  public async getLicenseObligations(spdxid: string): Promise<LicenseObligation> {
    const clientConfig = getHttpConfig();
    const scanossHttp = new HttpClient(clientConfig);
    const obligationURL = `${clientConfig.HOST_URL}/license/obligations/${spdxid}`;
    const response = await scanossHttp.get(obligationURL);
    if (!response.ok) {
      log.error('[ License obligations ]', response.statusText);
      throw new Error(response.statusText);
    }
    return response.json();
  }
}

export const licenseService = new LicenseService();
