import { ExportRepositoryMock } from '../ExportRepositoryMock';
import { toVulnerabilityExportData } from '../../../main/modules/export/helpers/exportHelper';
import { multipleVulnerabilitiesTestData } from '../mocks/vulnerability.model.mock';

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
});
