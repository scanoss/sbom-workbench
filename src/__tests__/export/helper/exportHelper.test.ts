import { ExportRepositoryMock } from '../ExportRepositoryMock';
import {
  getSPDXLicenseInfos, getSupplier, isValidPurl, purlAddVersion,
  removeRepeatedLicenses,
  toVulnerabilityExportData,
} from '../../../main/modules/export/helpers/exportHelper';
import { multipleVulnerabilitiesTestData } from '../mocks/vulnerability.model.mock';
import { ExportComponentData } from '../../../main/model/interfaces/report/ExportComponentData';

jest.mock('electron', () => ({
  app: {
    getPath: jest.fn(() => '/mock/path'),
    getName: jest.fn(() => 'MockAppName'),
    getVersion: jest.fn(() => '1.0.0'),
    // Add any other app methods you're using in your code
  },
  ipcMain: {
    on: jest.fn(),
    send: jest.fn(),
  },
  // Add any other Electron modules you're using
}));

// If you're using electron-log, you might want to mock it as well
jest.mock('electron-log', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  // Add any other methods from electron-log that you're using
}));

describe('export helper tests', () => {
  it('Convert to ComponentVulnerability to VulnerabilityData struct', async () => {
    const exportRepositoryMock = new ExportRepositoryMock();
    const vulnerabilityData = await exportRepositoryMock.getIdentifiedVulnerability();
    const vulnerabilityExportData = toVulnerabilityExportData(vulnerabilityData);
    expect(vulnerabilityExportData).toEqual([
      {
        affectedComponents: [
          {
            purl: 'pkg:github/scanoss/scanner.c',
            versions: [
              '1.0.0',
              '1.2.3',
            ],
          },
        ],
        cve: 'CVE-2017-6507',
        modified: '2024-11-21',
        published: '2017-03-24',
        rejectAt: null,
        severity: 'MEDIUM',
        source: 'NDV',
        summary: 'An issue was discovered in AppArmor before 2.12. Incorrect handling of unknown AppArmor profiles in ...',
      },
    ]);
  });

  it('Convert to ComponentVulnerability to VulnerabilityData struct, empty input', async () => {
    const vulnerabilityExportData = toVulnerabilityExportData([]);
    expect(vulnerabilityExportData).toEqual([]);
  });

  it('Convert to ComponentVulnerability to VulnerabilityData struct. Multiple Vulnerabilities', async () => {
    const exportRepositoryMock = new ExportRepositoryMock();
    exportRepositoryMock.setDetectedVulnerabilityData(multipleVulnerabilitiesTestData);
    const vulnerabilityData = await exportRepositoryMock.getDetectedVulnerability();
    const vulnerabilityExportData = toVulnerabilityExportData(vulnerabilityData);
    expect(vulnerabilityExportData).toEqual([
      {
        affectedComponents: [
          {
            purl: 'pkg:github/scanoss/scanner.c',
            versions: [
              '1.0.0',
            ],
          },
        ],
        cve: 'CVE-2017-6507',
        modified: '2024-11-21',
        published: '2017-03-24',
        rejectAt: null,
        severity: 'MEDIUM',
        source: 'NDV',
        summary: 'An issue was discovered in AppArmor before 2.12. Incorrect handling of unknown AppArmor profiles in ...',
      },
      {
        affectedComponents: [
          {
            purl: 'pkg:github/scanoss/scanner.c',
            versions: [
              '1.2.3',
            ],
          },
        ],
        cve: 'CVE-2017-6508',
        modified: '2024-11-21',
        published: '2017-03-24',
        rejectAt: null,
        severity: 'HIGH',
        source: 'NDV',
        summary: 'An issue was discovered in AppArmor before 2.12. Incorrect handling of unknown AppArmor profiles in ...',
      },
    ]);
  });

  it('Remove repeated licenses from string', async () => {
    const licensesCase1 = 'GPL-2.0-only AND GPL-2.0-only   AND LGPL-2.1-or-later AND MIT';
    let uniqueLicenses = removeRepeatedLicenses(licensesCase1);
    expect(uniqueLicenses).toEqual('GPL-2.0-only AND LGPL-2.1-or-later AND MIT');

    const licensesCase2 = 'GPL-2.0-only AND GPL-2.0-only OR MIT AND LGPL-2.1-or-later AND MIT';
    uniqueLicenses = removeRepeatedLicenses(licensesCase2);
    expect(uniqueLicenses).toEqual('GPL-2.0-only AND GPL-2.0-only OR MIT AND LGPL-2.1-or-later AND MIT');

    const licensesCase3 = 'GPL-2.0-or-later AND GPL-2.0-or-later WITH Font-exception-2.0 AND LicenseRef-scancode-bitstream';
    uniqueLicenses = removeRepeatedLicenses(licensesCase3);
    expect(uniqueLicenses).toEqual('GPL-2.0-or-later AND GPL-2.0-or-later WITH Font-exception-2.0 AND LicenseRef-scancode-bitstream');
  });

  it('get unique SPDX License Infos', async () => {
    const uniqueLicenseInfos = new Set<string>();
    const licensesCase1 = 'GPL-2.0-only AND GPL-2.0-only AND LGPL-2.1-or-later AND MIT';
    const uniqueLicenses: Array<ExtractedLicenseInfo> = [];
    uniqueLicenses.push(...getSPDXLicenseInfos(licensesCase1, uniqueLicenseInfos));

    const licensesCase2 = 'NAIST-2003 AND Unicode-3.0 AND LicenseRef-scancode-public-domain';
    uniqueLicenses.push(...getSPDXLicenseInfos(licensesCase2, uniqueLicenseInfos));

    const licensesCase3 = 'GPL-2.0-or-later AND GPL-2.0-or-later WITH Font-exception-2.0 AND LicenseRef-scancode-bitstream';
    uniqueLicenses.push(...getSPDXLicenseInfos(licensesCase3, uniqueLicenseInfos));

    // Only those licenses with LicenseRef are added to LicenseInfos
    expect(uniqueLicenses.length).toEqual(2);
    expect(new Set(uniqueLicenses.map((ul) => ul.licenseId)))
      .toEqual(new Set(['LicenseRef-scancode-public-domain', 'LicenseRef-scancode-bitstream']));
  });

  it('Test valid purl', async () => {
    const tests = [
      {
        purl: 'pkg:RFC4634',
        expectedResult: false,
      },
      {
        purl: 'pkg:SDK_2.x.x_KV5x',
        expectedResult: false,
      },
      {
        purl: 'pkg:Toshiba_TMPMK4SDK',
        expectedResult: false,
      },
      {
        purl: 'pkg:github/scanoss/scanner.c',
        expectedResult: true,
      },
    ];
    tests.forEach((test) => {
      expect(isValidPurl(test.purl)).toEqual(test.expectedResult);
    });
  });

  it('Test get supplier', async () => {
    const tests: Array<{
      component: ExportComponentData;
      expectedResult: string;
    }> = [
      {
        component: {
          component: 'RFC4634',
          purl: 'pkg:RFC4634',
          vendor: null,
          version: '1.0.0',
          detected_licenses: '',
          concluded_licenses: '',
          url: 'url',
          url_hash: null,
          download_url: null,
          unique_concluded_licenses: null,
          unique_detected_licenses: null,
        },
        expectedResult: 'NOASSERTION',
      },
      {
        component: {
          component: 'Toshiba_TMPMK4SDK',
          purl: 'pkg:Toshiba_TMPMK4SDK',
          vendor: null,
          version: '1.0.0',
          detected_licenses: '',
          concluded_licenses: '',
          url: 'url',
          url_hash: null,
          download_url: null,
          unique_concluded_licenses: null,
          unique_detected_licenses: null,
        },
        expectedResult: 'NOASSERTION',
      },
      {
        component: {
          component: 'scanner.c',
          purl: 'pkg:github/scanoss/scanner.c',
          vendor: null,
          version: '1.0.0',
          detected_licenses: '',
          concluded_licenses: '',
          url: 'url',
          url_hash: null,
          download_url: null,
          unique_concluded_licenses: null,
          unique_detected_licenses: null,
        },
        expectedResult: 'scanoss',
      },
      {
        component: {
          component: '',
          purl: 'pkg:github/scanoss/scanner.c',
          vendor: 'scanoss',
          version: '1.0.0',
          detected_licenses: '',
          concluded_licenses: '',
          url: 'url',
          url_hash: null,
          download_url: null,
          unique_concluded_licenses: null,
          unique_detected_licenses: null,
        },
        expectedResult: 'scanoss',
      },
    ];
    tests.forEach((test) => {
      expect(getSupplier(test.component)).toEqual(test.expectedResult);
    });
  });

  describe('purlAddVersion', () => {
    it('should add a normal version to a base purl', () => {
      const result = purlAddVersion('pkg:github/scanoss/scanner.c', '1.0.0');
      expect(result).toEqual('pkg:github/scanoss/scanner.c@1.0.0');
    });

    it('should properly encode @ characters in version', () => {
      // This is the case from the ticket - version contains @ characters
      const result = purlAddVersion('pkg:github/belgattitude/flowblade', '@flowblade/source-duckdb@0.1.13');
      expect(result).toEqual('pkg:github/belgattitude/flowblade@%40flowblade%2Fsource-duckdb%400.1.13');
    });

    it('should return purl without version when version is null', () => {
      const result = purlAddVersion('pkg:github/scanoss/scanner.c', null);
      expect(result).toEqual('pkg:github/scanoss/scanner.c');
    });

    it('should return null for invalid base purl', () => {
      const result = purlAddVersion('pkg:RFC4634', '1.0.0');
      expect(result).toBeNull();
    });

    it('should preserve qualifiers from base purl', () => {
      const result = purlAddVersion('pkg:npm/%40types/node?repository_url=https://registry.npmjs.org', '18.0.0');
      expect(result).toContain('@18.0.0');
      expect(result).toContain('repository_url=');
    });
  });
});
