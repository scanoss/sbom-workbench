import { LicenseDTO } from '@api/dto';
import { undefined } from 'zod';
import { licenses } from '@assets/data/licenses';
import { ExportRepository } from '../../main/modules/export/Repository/ExportRepository';
import { ExportComponentData } from '../../main/model/interfaces/report/ExportComponentData';
import { DecisionData } from '../../main/model/interfaces/report/DecisionData';
import { ComponentVulnerability } from '../../main/model/entity/ComponentVulnerability';
import { detectedVulnerabilityData, identifiedVulnerabilityData } from './mocks/vulnerability.model.mock';
import { ExportCryptographyData } from '../../main/model/interfaces/report/ExportCryptographyData';

export class ExportRepositoryMock implements ExportRepository {
  private mockDecisionData: Array<DecisionData>;

  private detectedVulnerabilityData: Array<ComponentVulnerability>;

  private identifiedVulnerabilityData: Array<ComponentVulnerability>;

  constructor() {
    this.mockDecisionData = [];
    this.detectedVulnerabilityData = detectedVulnerabilityData;
    this.identifiedVulnerabilityData = identifiedVulnerabilityData;
  }

  public setDecisionMockData(data: Array<DecisionData>) {
    this.mockDecisionData = data;
  }

  public setIdentifiedMockData(data: Array<ComponentVulnerability>) {
    this.identifiedVulnerabilityData = data;
  }

  public setDetectedVulnerabilityData(data: Array<ComponentVulnerability>) {
    this.detectedVulnerabilityData = data;
  }

  public async getDecisionData(): Promise<Array<DecisionData>> {
    return new Promise<Array<DecisionData>>((resolve) => {
      resolve(this.mockDecisionData);
    });
  }

  getDetectedData(): Promise<ExportComponentData[]> {
    return Promise.resolve([
      {
        component: 'gentoo',
        purl: 'pkg:github/gentoo/gentoo',
        version: '53bd330',
        vendor: 'gentoo',
        detected_licenses: 'SSPL-1.0 AND LicenseRef-scancode-unknown-license-reference AND LicenseRef-sspl '
          + 'AND LicenseRef-scancode-other-copyleft AND LicenseRef-scancode-warranty-disclaimer',
        concluded_licenses: '',
        url: 'https://github.com/gentoo/gentoo',
        url_hash: '7f25711ba80970b0de14230872becfc8',
        download_url: 'https://github.com/gentoo/gentoo/archive/53bd330.zip',
      },
      {
        component: 'openbmc',
        purl: 'pkg:github/ibm-openbmc/openbmc',
        version: 'ibm-1020-29.0-public',
        vendor: 'ibm-openbmc',
        detected_licenses: 'Apache-2.0 AND BSD-2-Clause AND BSD-3-Clause AND FSFULLR '
          + 'AND GPL-1.0-or-later AND GPL-2.0-only AND GPL-2.0-or-later AND LGPL-2.0-or-later '
          + 'AND LGPL-2.1-or-later AND MIT AND OFL-1.1 AND Zlib AND BSD-3-Clause-flex '
          + 'AND LicenseRef-scancode-unknown-license-reference AND LicenseRef-gpl-2.0-only-with-linux-syscall-note '
          + 'AND LicenseRef-scancode-flex-2.5 AND MIT OR GPL-1.0-or-later',
        concluded_licenses: '',
        url: 'https://github.com/ibm-openbmc/openbmc',
        url_hash: 'c66ae093319881bccc1f45e87069f023',
        download_url: 'https://github.com/ibm-openbmc/openbmc/archive/ibm-1020-29.0-public.zip',
      },
    ]);
  }

  getIdentifiedData(): Promise<ExportComponentData[]> {
    return Promise.resolve([
      {
        component: 'gentoo',
        purl: 'pkg:github/gentoo/gentoo',
        version: '1.2.0',
        vendor: null,
        detected_licenses: 'LGPL-3.0',
        concluded_licenses: 'SSPL-1.0',
        url: 'https://github.com/gentoo/gentoo',
        url_hash: null,
        download_url: null,
      },
      {
        component: 'gentoo',
        purl: 'pkg:github/gentoo/gentoo',
        version: '53bd330',
        vendor: 'gentoo',
        detected_licenses: 'SSPL-1.0 AND LicenseRef-scancode-unknown-license-reference '
          + 'AND LicenseRef-sspl AND LicenseRef-scancode-other-copyleft AND LicenseRef-scancode-warranty-disclaimer',
        concluded_licenses: 'Beerware',
        url: 'https://github.com/gentoo/gentoo',
        url_hash: '7f25711ba80970b0de14230872becfc8',
        download_url: 'https://github.com/gentoo/gentoo/archive/53bd330.zip',
      },
    ]);
  }

  getRawData() {
  }

  getWfpData(): Promise<string> {
    return Promise.resolve('');
  }

  getDetectedVulnerability(): Promise<Array<ComponentVulnerability>> {
    return Promise.resolve(this.detectedVulnerabilityData);
  }

  getIdentifiedVulnerability(): Promise<Array<ComponentVulnerability>> {
    return Promise.resolve(this.identifiedVulnerabilityData);
  }

  getAllLicensesWithFullText(): Promise<Array<LicenseDTO>> {
    return Promise.resolve(licenses as unknown as LicenseDTO[]);
  }

  getCBOMDetectedData(): Promise<ExportCryptographyData> {
    return Promise.resolve({
      localCryptography: [
        {
          name: '/external/src/winnowing.c',
          type: 'algorithm',
          values: ['md5', 'crc32'],
        },
        {
          name: '/external/src/winnowing.c',
          type: 'library',
          values: ['library/openssl', 'library/webcrypto'],
        },
      ],
      componentCryptography: [
        {
          name: 'pkg:github/scanoss/engine@4.0.4',
          type: 'algorithm',
          values: ['md5'],
        },
        {
          name: 'pkg:github/scanoss/engine@4.0.4',
          type: 'library',
          values: ['library/openssl'],
        },
      ],
    });
  }

  getCBOMIdentifiedData(): Promise<ExportCryptographyData> {
    return Promise.resolve({
      localCryptography: [
        {
          name: '/external/src/winnowing.c',
          type: 'algorithm',
          values: ['md5', 'crc32'],
        },
        {
          name: '/external/src/winnowing.c',
          type: 'library',
          values: ['library/openssl', 'library/webcrypto'],
        },
      ],
      componentCryptography: [],
    });
  }
}
