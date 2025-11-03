import { LicenseDTO } from '@api/dto';
import { undefined } from 'zod';
import { licenses } from '@assets/data/licenses';
import { ExportRepository } from '../../main/modules/export/Repository/ExportRepository';
import { ExportComponentData } from '../../main/model/interfaces/report/ExportComponentData';
import { DecisionData } from '../../main/model/interfaces/report/DecisionData';
import { ComponentVulnerability } from '../../main/model/entity/ComponentVulnerability';
import { detectedVulnerabilityData, identifiedVulnerabilityData } from './mocks/vulnerability.model.mock';
import { ExportCryptographyData } from '../../main/model/interfaces/report/ExportCryptographyData';
import { DataRecord } from '../../main/model/interfaces/report/DataRecord';

export class ExportRepositoryMock implements ExportRepository {
  private mockDecisionData: Array<DecisionData>;

  private detectedVulnerabilityData: Array<ComponentVulnerability>;

  private identifiedVulnerabilityData: Array<ComponentVulnerability>;

  private SBOM;

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
        detected_licenses:
          'SSPL-1.0 AND LicenseRef-scancode-unknown-license-reference AND LicenseRef-sspl ' +
          'AND LicenseRef-scancode-other-copyleft AND LicenseRef-scancode-warranty-disclaimer',
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
        detected_licenses:
          'Apache-2.0 AND BSD-2-Clause AND BSD-3-Clause AND FSFULLR ' +
          'AND GPL-1.0-or-later AND GPL-2.0-only AND GPL-2.0-or-later AND LGPL-2.0-or-later ' +
          'AND LGPL-2.1-or-later AND MIT AND OFL-1.1 AND Zlib AND BSD-3-Clause-flex ' +
          'AND LicenseRef-scancode-unknown-license-reference AND LicenseRef-gpl-2.0-only-with-linux-syscall-note ' +
          'AND LicenseRef-scancode-flex-2.5 AND MIT OR GPL-1.0-or-later',
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
        detected_licenses:
          'SSPL-1.0 AND LicenseRef-scancode-unknown-license-reference ' +
          'AND LicenseRef-sspl AND LicenseRef-scancode-other-copyleft AND LicenseRef-scancode-warranty-disclaimer',
        concluded_licenses: 'Beerware',
        url: 'https://github.com/gentoo/gentoo',
        url_hash: '7f25711ba80970b0de14230872becfc8',
        download_url: 'https://github.com/gentoo/gentoo/archive/53bd330.zip',
      },
    ]);
  }

  getRawData() {}

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

  getAllDetectedRecordFiles(): Promise<Array<DataRecord>> {
    return Promise.resolve([
      {
        inventory_id: 0,
        path: "/external/src/winnowing.c",
        usage: "snippet",
        detected_component: "engine",
        concluded_component: "",
        detected_purl: "pkg:github/scanoss/engine",
        concluded_purl: "",
        detected_version: "3.27",
        concluded_version: "",
        latest_version: "14cde42",
        detected_license: "GPL-2.0-only AND GPL-2.0-or-later",
        concluded_license: "",
        detected_url: "https://github.com/scanoss/engine",
        concluded_url: "",
        comment: ""
      },
      {
        inventory_id: 0,
        path: "/inc/scanner.h",
        usage: "snippet",
        detected_component: "scanner.c",
        concluded_component: "",
        detected_purl: "pkg:github/scanoss/scanner.c",
        concluded_purl: "",
        detected_version: "v1.3.0",
        concluded_version: "",
        latest_version: "v1.3.0",
        detected_license: "GPL-2.0-only AND GPL-2.0-or-later",
        concluded_license: "",
        detected_url: "https://github.com/scanoss/scanner.c",
        concluded_url: "",
        comment: ""
      },
      {
        inventory_id: 0,
        path: "/src/blacklist_ext.h",
        usage: "snippet",
        detected_component: "minr",
        concluded_component: "",
        detected_purl: "pkg:github/scanoss/minr",
        concluded_purl: "",
        detected_version: "1.18",
        concluded_version: "",
        latest_version: "d0dea1d",
        detected_license: "GPL-2.0-only",
        concluded_license: "",
        detected_url: "https://github.com/scanoss/minr",
        concluded_url: "",
        comment: ""
      },
      {
        inventory_id: 0,
        path: "/src/cyclonedx.c",
        usage: "snippet",
        detected_component: "scanner.c",
        concluded_component: "",
        detected_purl: "pkg:github/scanoss/scanner.c",
        concluded_purl: "",
        detected_version: "v1.3.3",
        concluded_version: "",
        latest_version: "v1.3.3",
        detected_license: "BSD-2-Clause AND GPL-2.0-only",
        concluded_license: "",
        detected_url: "https://github.com/scanoss/scanner.c",
        concluded_url: "",
        comment: ""
      },
      {
        inventory_id: 0,
        path: "/src/format_utils.c",
        usage: "snippet",
        detected_component: "scanner.c",
        concluded_component: "",
        detected_purl: "pkg:github/scanoss/scanner.c",
        concluded_purl: "",
        detected_version: "v1.3.3",
        concluded_version: "",
        latest_version: "v1.3.3",
        detected_license: "BSD-2-Clause AND GPL-2.0-only",
        concluded_license: "",
        detected_url: "https://github.com/scanoss/scanner.c",
        concluded_url: "",
        comment: ""
      },
      {
        inventory_id: 0,
        path: "/src/main.c",
        usage: "snippet",
        detected_component: "oss-eu-demo",
        concluded_component: "",
        detected_purl: "pkg:github/scanoss/oss-eu-demo",
        concluded_purl: "",
        detected_version: "0233d7b",
        concluded_version: "",
        latest_version: "0233d7b",
        detected_license: "GPL-2.0-or-later",
        concluded_license: "",
        detected_url: "https://github.com/scanoss/oss-eu-demo",
        concluded_url: "",
        comment: ""
      },
      {
        inventory_id: 0,
        path: "/src/spdx.c",
        usage: "snippet",
        detected_component: "scanner.c",
        concluded_component: "",
        detected_purl: "pkg:github/scanoss/scanner.c",
        concluded_purl: "",
        detected_version: "v1.3.3",
        concluded_version: "",
        latest_version: "v1.3.4",
        detected_license: "BSD-2-Clause AND GPL-2.0-only",
        concluded_license: "",
        detected_url: "https://github.com/scanoss/scanner.c",
        concluded_url: "",
        comment: ""
      },
      {
        inventory_id: 0,
        path: "/external/inc/json.h",
        usage: "file",
        detected_component: "scanner.c",
        concluded_component: "",
        detected_purl: "pkg:github/scanoss/scanner.c",
        concluded_purl: "",
        detected_version: "v1.3.3",
        concluded_version: "",
        latest_version: "v1.3.4",
        detected_license: "BSD-2-Clause AND GPL-2.0-only",
        concluded_license: "",
        detected_url: "https://github.com/scanoss/scanner.c",
        concluded_url: "",
        comment: ""
      },
      {
        inventory_id: 0,
        path: "/external/inc/log.h",
        usage: "file",
        detected_component: "scanner.c",
        concluded_component: "",
        detected_purl: "pkg:github/scanoss/scanner.c",
        concluded_purl: "",
        detected_version: "v1.1.4",
        concluded_version: "",
        latest_version: "v1.3.4",
        detected_license: "GPL-2.0-only",
        concluded_license: "",
        detected_url: "https://github.com/scanoss/scanner.c",
        concluded_url: "",
        comment: ""
      }
      ]);
  }

  getAllIdentifiedRecordFiles(): Promise<Array<DataRecord>> {
    return Promise.resolve([
      {
        inventory_id: 2,
        path: "/inc/scanner.h",
        usage: "snippet",
        detected_component: "scanner.c",
        concluded_component: "scanner.c",
        detected_purl: "pkg:github/scanoss/scanner.c",
        concluded_purl: "pkg:github/scanoss/scanner.c",
        detected_version: "v1.3.0",
        concluded_version: "v1.3.3",
        latest_version: "v1.3.0",
        detected_license: "BSD-2-Clause AND GPL-2.0-only",
        concluded_license: "GPL-2.0-only",
        detected_url: "https://github.com/scanoss/scanner.c",
        concluded_url: "https://github.com/scanoss/scanner.c",
        comment: "inventory 1"
      },
      {
        inventory_id: 2,
        path: "/src/cyclonedx.c",
        usage: "snippet",
        detected_component: "scanner.c",
        concluded_component: "scanner.c",
        detected_purl: "pkg:github/scanoss/scanner.c",
        concluded_purl: "pkg:github/scanoss/scanner.c",
        detected_version: "v1.3.3",
        concluded_version: "v1.3.3",
        latest_version: "v1.3.3",
        detected_license: "BSD-2-Clause AND GPL-2.0-only",
        concluded_license: "GPL-2.0-only",
        detected_url: "https://github.com/scanoss/scanner.c",
        concluded_url: "https://github.com/scanoss/scanner.c",
        comment: "inventory 1"
      },
      {
        inventory_id: 2,
        path: "/src/format_utils.c",
        usage: "snippet",
        detected_component: "scanner.c",
        concluded_component: "scanner.c",
        detected_purl: "pkg:github/scanoss/scanner.c",
        concluded_purl: "pkg:github/scanoss/scanner.c",
        detected_version: "v1.3.3",
        concluded_version: "v1.3.3",
        latest_version: "v1.3.3",
        detected_license: "BSD-2-Clause AND GPL-2.0-only",
        concluded_license: "GPL-2.0-only",
        detected_url: "https://github.com/scanoss/scanner.c",
        concluded_url: "https://github.com/scanoss/scanner.c",
        comment: "inventory 1"
      },
      {
        inventory_id: 2,
        path: "/src/spdx.c",
        usage: "snippet",
        detected_component: "scanner.c",
        concluded_component: "scanner.c",
        detected_purl: "pkg:github/scanoss/scanner.c",
        concluded_purl: "pkg:github/scanoss/scanner.c",
        detected_version: "v1.3.3",
        concluded_version: "v1.3.3",
        latest_version: "v1.3.4",
        detected_license: "BSD-2-Clause AND GPL-2.0-only",
        concluded_license: "GPL-2.0-only",
        detected_url: "https://github.com/scanoss/scanner.c",
        concluded_url: "https://github.com/scanoss/scanner.c",
        comment: "inventory 1"
      },
      {
        inventory_id: 4,
        path: "/external/src/winnowing.c",
        usage: "snippet",
        detected_component: "engine",
        concluded_component: "engine",
        detected_purl: "pkg:github/scanoss/engine",
        concluded_purl: "pkg:github/scanoss/engine",
        detected_version: "3.27",
        concluded_version: "v5.4.0",
        latest_version: "14cde42",
        detected_license: "GPL-2.0-only",
        concluded_license: "GPL-2.0-only",
        detected_url: "https://github.com/scanoss/engine",
        concluded_url: "https://github.com/scanoss/engine",
        comment: "inventory 2"
      },
      {
        inventory_id: 5,
        path: "/src/blacklist_ext.h",
        usage: "snippet",
        detected_component: "minr",
        concluded_component: "scanner.c",
        detected_purl: "pkg:github/scanoss/minr",
        concluded_purl: "pkg:github/scanoss/scanner.c",
        detected_version: "1.18",
        concluded_version: "v1.3.3",
        latest_version: "d0dea1d",
        detected_license: "BSD-2-Clause AND GPL-2.0-only",
        concluded_license: "GPL-2.0-only",
        detected_url: "https://github.com/scanoss/minr",
        concluded_url: "https://github.com/scanoss/scanner.c",
        comment: "inventory 3"
      },
      {
        inventory_id: 1,
        path: "/external/inc/json.h",
        usage: "file",
        detected_component: "scanner.c",
        concluded_component: "scanner.c",
        detected_purl: "pkg:github/scanoss/scanner.c",
        concluded_purl: "pkg:github/scanoss/scanner.c",
        detected_version: "v1.3.3",
        concluded_version: "v1.3.3",
        latest_version: "v1.3.4",
        detected_license: "BSD-2-Clause AND GPL-2.0-only",
        concluded_license: "GPL-2.0-only",
        detected_url: "https://github.com/scanoss/scanner.c",
        concluded_url: "https://github.com/scanoss/scanner.c",
        comment: "inventory 1"
      },
      {
        inventory_id: 1,
        path: "/external/inc/log.h",
        usage: "file",
        detected_component: "scanner.c",
        concluded_component: "scanner.c",
        detected_purl: "pkg:github/scanoss/scanner.c",
        concluded_purl: "pkg:github/scanoss/scanner.c",
        detected_version: "v1.1.4",
        concluded_version: "v1.3.3",
        latest_version: "v1.3.4",
        detected_license: "BSD-2-Clause AND GPL-2.0-only",
        concluded_license: "GPL-2.0-only",
        detected_url: "https://github.com/scanoss/scanner.c",
        concluded_url: "https://github.com/scanoss/scanner.c",
        comment: "inventory 1"
      },
      {
        inventory_id: 1,
        path: "/external/src/json.c",
        usage: "file",
        detected_component: "scanner.c",
        concluded_component: "scanner.c",
        detected_purl: "pkg:github/scanoss/scanner.c",
        concluded_purl: "pkg:github/scanoss/scanner.c",
        detected_version: "v1.3.3",
        concluded_version: "v1.3.3",
        latest_version: "v1.3.4",
        detected_license: "BSD-2-Clause AND GPL-2.0-only",
        concluded_license: "GPL-2.0-only",
        detected_url: "https://github.com/scanoss/scanner.c",
        concluded_url: "https://github.com/scanoss/scanner.c",
        comment: "inventory 1"
      },
      {
        inventory_id: 1,
        path: "/external/src/log.c",
        usage: "file",
        detected_component: "scanner.c",
        concluded_component: "scanner.c",
        detected_purl: "pkg:github/scanoss/scanner.c",
        concluded_purl: "pkg:github/scanoss/scanner.c",
        detected_version: "v1.3.3",
        concluded_version: "v1.3.3",
        latest_version: "v1.3.4",
        detected_license: "BSD-2-Clause AND GPL-2.0-only",
        concluded_license: "GPL-2.0-only",
        detected_url: "https://github.com/scanoss/scanner.c",
        concluded_url: "https://github.com/scanoss/scanner.c",
        comment: "inventory 1"
      },
      {
        inventory_id: 1,
        path: "/inc/format_utils.h",
        usage: "file",
        detected_component: "scanner.c",
        concluded_component: "scanner.c",
        detected_purl: "pkg:github/scanoss/scanner.c",
        concluded_purl: "pkg:github/scanoss/scanner.c",
        detected_version: "v1.3.3",
        concluded_version: "v1.3.3",
        latest_version: "v1.3.4",
        detected_license: "BSD-2-Clause AND GPL-2.0-only",
        concluded_license: "GPL-2.0-only",
        detected_url: "https://github.com/scanoss/scanner.c",
        concluded_url: "https://github.com/scanoss/scanner.c",
        comment: "inventory 1"
      },
      {
        inventory_id: 1,
        path: "/packages/debian/control",
        usage: "file",
        detected_component: "scanner.c",
        concluded_component: "scanner.c",
        detected_purl: "pkg:github/scanoss/scanner.c",
        concluded_purl: "pkg:github/scanoss/scanner.c",
        detected_version: "v1.1.6",
        concluded_version: "v1.3.3",
        latest_version: "v1.3.4",
        detected_license: "BSD-2-Clause AND GPL-2.0-only",
        concluded_license: "GPL-2.0-only",
        detected_url: "https://github.com/scanoss/scanner.c",
        concluded_url: "https://github.com/scanoss/scanner.c",
        comment: "inventory 1"
      },
      {
        inventory_id: 1,
        path: "/scanner.c-1.3.3.zip",
        usage: "file",
        detected_component: "scanner.c",
        concluded_component: "scanner.c",
        detected_purl: "pkg:github/scanoss/scanner.c",
        concluded_purl: "pkg:github/scanoss/scanner.c",
        detected_version: "v1.3.3",
        concluded_version: "v1.3.3",
        latest_version: "v1.3.3",
        detected_license: "BSD-2-Clause AND GPL-2.0-only",
        concluded_license: "GPL-2.0-only",
        detected_url: "https://github.com/scanoss/scanner.c",
        concluded_url: "https://github.com/scanoss/scanner.c",
        comment: "inventory 1"
      },
      {
        inventory_id: 3,
        path: "/external/inc/winnowing.h",
        usage: "file",
        detected_component: "engine",
        concluded_component: "engine",
        detected_purl: "pkg:github/scanoss/engine",
        concluded_purl: "pkg:github/scanoss/engine",
        detected_version: "v5.4.0",
        concluded_version: "v5.4.0",
        latest_version: "87036c7",
        detected_license: "GPL-2.0-only",
        concluded_license: "GPL-2.0-only",
        detected_url: "https://github.com/scanoss/engine",
        concluded_url: "https://github.com/scanoss/engine",
        comment: "inventory 2"
      },
      {
        inventory_id: 6,
        path: "/package.json",
        usage: "dependency",
        detected_component: "@grpc/grpc-js",
        concluded_component: "@grpc/grpc-js",
        detected_purl: "pkg:npm/%40grpc/grpc-js",
        concluded_purl: "pkg:npm/%40grpc/grpc-js",
        detected_version: "1.13.3",
        concluded_version: "1.13.3",
        latest_version: "",
        detected_license: "Apache-2.0",
        concluded_license: "Apache-2.0",
        detected_url: "",
        concluded_url: "",
        comment: ""
      }
    ]);
  }
}
