import { ExportSource, ExportStatusCode } from '../../../api/types';
import { ExportRepositoryMock } from '../ExportRepositoryMock';
import { SBOMCsv } from '../../../main/modules/export/format/CSV/SBOM-csv';


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

describe('SBOM CSV Tests', () => {
  let exportRepositoryMock: ExportRepositoryMock;
  beforeEach(() => {
    exportRepositoryMock = new ExportRepositoryMock();
  });

  it('SBOM CSV identified export test', async () => {
    const SBOMCSVReport = new SBOMCsv(ExportSource.IDENTIFIED, exportRepositoryMock);
    const { report, status } = await SBOMCSVReport.generate();
    expect(status.code).toEqual(ExportStatusCode.SUCCESS);

    // Parse the CSV string manually
    const lines = report.trim().split('\n');
    expect(lines.length).toBeGreaterThan(1); // At least header + one data row

    // Get and validate headers
    const headers = lines[0].split(',').map((header) => header.trim());
    const expectedHeaders = ['path', 'usage', 'detected_component', 'concluded_component', 'detected_purl', 'concluded_purl', 'detected_version', 'concluded_version', 'detected_url', 'concluded_url', 'latest_version', 'detected_license', 'concluded_license', 'comment'];
    expect(headers).toEqual(expectedHeaders);

    // Column indexes based on headers
    const colIndex = {
      path: 0,
      usage: 1,
      detected_component: 2,
      concluded_component: 3,
      detected_purl: 4,
      concluded_purl: 5,
      detected_version: 6,
      concluded_version: 7,
      detected_url: 8,
      concluded_url: 9,
      latest_version: 10,
      detected_license: 11,
      concluded_license: 12,
      comment: 13
    };

    // Validate first data row - scanner.c (has concluded fields populated)
    const row1 = lines[1].split(',').map((column) => column.trim());
    expect(row1[colIndex.path]).toBe('/inc/scanner.h');
    expect(row1[colIndex.usage]).toBe('snippet');
    expect(row1[colIndex.detected_purl]).toBe('pkg:github/scanoss/scanner.c');
    expect(row1[colIndex.concluded_purl]).toBe('pkg:github/scanoss/scanner.c');
    expect(row1[colIndex.detected_version]).toBe('v1.3.0');
    expect(row1[colIndex.concluded_version]).toBe('v1.3.3');
    expect(row1[colIndex.detected_url]).toBe('https://github.com/scanoss/scanner.c');
    expect(row1[colIndex.concluded_url]).toBe('https://github.com/scanoss/scanner.c');
    expect(row1[colIndex.detected_license]).toBe('BSD-2-Clause AND GPL-2.0-only');
    expect(row1[colIndex.concluded_license]).toBe('GPL-2.0-only');
    expect(row1[colIndex.comment]).toBe('inventory 1');

    // Validate engine row (has concluded fields populated)
    const row5 = lines[5].split(',').map((column) => column.trim());
    expect(row5[colIndex.path]).toBe('/external/src/winnowing.c');
    expect(row5[colIndex.usage]).toBe('snippet');
    expect(row5[colIndex.detected_purl]).toBe('pkg:github/scanoss/engine');
    expect(row5[colIndex.concluded_purl]).toBe('pkg:github/scanoss/engine');
    expect(row5[colIndex.detected_version]).toBe('3.27');
    expect(row5[colIndex.concluded_version]).toBe('v5.4.0');
    expect(row5[colIndex.detected_url]).toBe('https://github.com/scanoss/engine');
    expect(row5[colIndex.concluded_url]).toBe('https://github.com/scanoss/engine');
    expect(row5[colIndex.detected_license]).toBe('GPL-2.0-only');
    expect(row5[colIndex.concluded_license]).toBe('GPL-2.0-only');
    expect(row5[colIndex.comment]).toBe('inventory 2');

    // Validate different component row (minr -> scanner.c, has concluded fields populated)
    const row6 = lines[6].split(',').map((column) => column.trim());
    expect(row6[colIndex.path]).toBe('/src/blacklist_ext.h');
    expect(row6[colIndex.usage]).toBe('snippet');
    expect(row6[colIndex.detected_purl]).toBe('pkg:github/scanoss/minr');
    expect(row6[colIndex.concluded_purl]).toBe('pkg:github/scanoss/scanner.c');
    expect(row6[colIndex.detected_version]).toBe('1.18');
    expect(row6[colIndex.concluded_version]).toBe('v1.3.3');
    expect(row6[colIndex.detected_url]).toBe('https://github.com/scanoss/minr');
    expect(row6[colIndex.concluded_url]).toBe('https://github.com/scanoss/scanner.c');
    expect(row6[colIndex.detected_license]).toBe('BSD-2-Clause AND GPL-2.0-only');
    expect(row6[colIndex.concluded_license]).toBe('GPL-2.0-only');
    expect(row6[colIndex.comment]).toBe('inventory 3');
  });

  it('SBOM CSV detected export test', async () => {
    const SBOMCSVReport = new SBOMCsv(ExportSource.DETECTED, exportRepositoryMock);
    const { report, status } = await SBOMCSVReport.generate();
    expect(status.code).toEqual(ExportStatusCode.SUCCESS);
    // Parse the CSV string manually
    const lines = report.trim().split('\n');
    expect(lines.length).toBeGreaterThan(1); // At least header + one data row

    // Get and validate headers
    const headers = lines[0].split(',').map((header) => header.trim());
    const expectedHeaders = ['path', 'usage', 'detected_component', 'concluded_component', 'detected_purl', 'concluded_purl', 'detected_version', 'concluded_version', 'detected_url', 'concluded_url', 'latest_version', 'detected_license', 'concluded_license', 'comment'];
    expect(headers).toEqual(expectedHeaders);

    // Column indexes based on headers
    const colIndex = {
      path: 0,
      usage: 1,
      detected_component: 2,
      concluded_component: 3,
      detected_purl: 4,
      concluded_purl: 5,
      detected_version: 6,
      concluded_version: 7,
      detected_url: 8,
      concluded_url: 9,
      latest_version: 10,
      detected_license: 11,
      concluded_license: 12,
      comment: 13
    };

    // Validate first data row - engine (concluded fields are empty)
    const row1 = lines[1].split(',').map((column) => column.trim());
    expect(row1[colIndex.path]).toBe('/external/src/winnowing.c');
    expect(row1[colIndex.usage]).toBe('snippet');
    expect(row1[colIndex.detected_purl]).toBe('pkg:github/scanoss/engine');
    expect(row1[colIndex.concluded_purl]).toBe('');
    expect(row1[colIndex.detected_version]).toBe('3.27');
    expect(row1[colIndex.concluded_version]).toBe('');
    expect(row1[colIndex.detected_url]).toBe('https://github.com/scanoss/engine');
    expect(row1[colIndex.concluded_url]).toBe('');
    expect(row1[colIndex.detected_license]).toBe('GPL-2.0-only AND GPL-2.0-or-later');
    expect(row1[colIndex.concluded_license]).toBe('');
    expect(row1[colIndex.comment]).toBe('');

    // Validate second data row - scanner.c (concluded fields are empty)
    const row2 = lines[2].split(',').map((column) => column.trim());
    expect(row2[colIndex.path]).toBe('/inc/scanner.h');
    expect(row2[colIndex.usage]).toBe('snippet');
    expect(row2[colIndex.detected_purl]).toBe('pkg:github/scanoss/scanner.c');
    expect(row2[colIndex.concluded_purl]).toBe('');
    expect(row2[colIndex.detected_version]).toBe('v1.3.0');
    expect(row2[colIndex.concluded_version]).toBe('');
    expect(row2[colIndex.detected_url]).toBe('https://github.com/scanoss/scanner.c');
    expect(row2[colIndex.concluded_url]).toBe('');
    expect(row2[colIndex.detected_license]).toBe('GPL-2.0-only AND GPL-2.0-or-later');
    expect(row2[colIndex.concluded_license]).toBe('');
    expect(row2[colIndex.comment]).toBe('');

    // Validate third data row - minr (concluded fields are empty)
    const row3 = lines[3].split(',').map((column) => column.trim());
    expect(row3[colIndex.path]).toBe('/src/blacklist_ext.h');
    expect(row3[colIndex.usage]).toBe('snippet');
    expect(row3[colIndex.detected_purl]).toBe('pkg:github/scanoss/minr');
    expect(row3[colIndex.concluded_purl]).toBe('');
    expect(row3[colIndex.detected_version]).toBe('1.18');
    expect(row3[colIndex.concluded_version]).toBe('');
    expect(row3[colIndex.detected_url]).toBe('https://github.com/scanoss/minr');
    expect(row3[colIndex.concluded_url]).toBe('');
    expect(row3[colIndex.detected_license]).toBe('GPL-2.0-only');
    expect(row3[colIndex.concluded_license]).toBe('');
    expect(row3[colIndex.comment]).toBe('');
  });
});
