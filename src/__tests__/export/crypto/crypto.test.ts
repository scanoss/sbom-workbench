import { Crypto } from '../../../main/modules/export/format/Crypto';
import { ExportSource, ExportStatusCode } from '../../../api/types';
import { ExportRepositoryMock } from '../ExportRepositoryMock';


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

describe('Crypto export tests', () => {
  let exportRepositoryMock: ExportRepositoryMock;
  beforeEach(() => {
    exportRepositoryMock = new ExportRepositoryMock();
  });

  it('Crypto identified export test', async () => {
    const cryptoExport = new Crypto(ExportSource.IDENTIFIED, exportRepositoryMock);
    const { report, status } = await cryptoExport.generate();
    expect(status.code).toEqual(ExportStatusCode.SUCCESS);

    // Parse the CSV string manually
    const lines = report.trim().split('\n');
    expect(lines.length).toBeGreaterThan(1); // At least header + one data row

    // Get and validate headers
    const headers = lines[0].split(',').map((header) => header.trim());
    const expectedHeaders = ['source', 'type', 'value'];
    expectedHeaders.forEach((header) => {
      expect(headers).toContain(header);
    });

    const expectedSource = ['/external/src/winnowing.c'];
    const expectedTypes = ['algorithm', 'library'];
    const expectedValues = ['md5', 'crc32', 'library/openssl', 'library/webcrypto'];
    // Validate output
    for (let i = 1; i < lines.length; i++) {
      const columns = lines[i].split(',').map((column) => column.trim());
      expect(expectedSource).toContain(columns[0]);
      expect(expectedTypes).toContain(columns[1]);
      expect(expectedValues).toContain(columns[2]);
    }
  });

  it('Crypto detected export test', async () => {
    const cryptoExport = new Crypto(ExportSource.DETECTED, exportRepositoryMock);
    const { report, status } = await cryptoExport.generate();
    expect(status.code).toEqual(ExportStatusCode.SUCCESS);
    // Parse the CSV string manually
    const lines = report.trim().split('\n');
    expect(lines.length).toBeGreaterThan(1); // At least header + one data row

    // Get and validate headers
    const headers = lines[0].split(',').map((header) => header.trim());
    const expectedHeaders = ['source', 'type', 'value']; // Replace with your actual headers
    expectedHeaders.forEach((header) => {
      expect(headers).toContain(header);
    });

    const expectedSource = ['/external/src/winnowing.c', 'pkg:github/scanoss/engine@4.0.4'];
    const expectedTypes = ['algorithm', 'library'];
    const expectedValues = ['md5', 'crc32', 'library/openssl', 'library/webcrypto'];
    // Validate output
    for (let i = 1; i < lines.length; i++) {
      const columns = lines[i].split(',').map((column) => column.trim());
      expect(expectedSource).toContain(columns[0]);
      expect(expectedTypes).toContain(columns[1]);
      expect(expectedValues).toContain(columns[2]);
    }
  });
});
