import { ScanossJson } from '../../main/modules/export/format/ScanossJson';
import { ExportSource } from '../../api/types';
import { ExportRepositoryMock } from './ExportRepositoryMock';

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

describe('export tests', () => {
  let scanossJsonFormat: ScanossJson;
  let exportRepositoryMock: ExportRepositoryMock;
  // ...
  beforeEach(() => {
    exportRepositoryMock = new ExportRepositoryMock();
    scanossJsonFormat = new ScanossJson(ExportSource.IDENTIFIED, exportRepositoryMock);

    jest.clearAllMocks();
  });

  it('should generate correct SCANOSS JSON', async () => {
    exportRepositoryMock.setMockData({ scanossJsonComponentData: [
      { purl: 'pkg:github/scanoss/engine', totalMatchedFiles: 1, identifiedFiles: 0, ignoredFiles: 1, source: 'engine' },
      { purl: 'pkg:github/scanoss/scanner.c', totalMatchedFiles: 12, identifiedFiles: 12, ignoredFiles: 1, source: 'engine' },
      { purl: 'pkg:github/scanoss/minr', totalMatchedFiles: 2, identifiedFiles: 0, ignoredFiles: 0, source: 'engine' },
      { purl: 'pkg:github/scanoss/scanoss.java', totalMatchedFiles: 1, identifiedFiles: 0, ignoredFiles: 1, source: 'engine' },
      { purl: 'test', totalMatchedFiles: 0, identifiedFiles: 1, ignoredFiles: 0, source: 'manual' },
    ],
    scanossJsonFileData: [
      { path: '/external/inc/json.h', purl: 'pkg:github/scanoss/scanner.c' },
    ],
    });

    const expectedOutput = { bom: {
      include: [
        {
          purl: 'pkg:github/scanoss/scanner.c',
        },
        {
          purl: 'test',
        },
      ],
      remove: [
        {
          purl: 'pkg:github/scanoss/engine',
        },
        {
          purl: 'pkg:github/scanoss/scanoss.java',
        },
        {
          path: '/external/inc/json.h',
          purl: 'pkg:github/scanoss/scanner.c',
        },
      ],
      replaced: [],
    },
    };

    const scanossJson = await scanossJsonFormat.generate();
    expect(scanossJson).toEqual(JSON.stringify(expectedOutput, null, 2));
  });

  it('Should generate scanoss.json with populated include and empty remove arrays', async () => {
    exportRepositoryMock.setMockData({ scanossJsonComponentData: [
      { purl: 'pkg:github/scanoss/engine', totalMatchedFiles: 1, identifiedFiles: 1, ignoredFiles: 0, source: 'engine' },
      { purl: 'pkg:github/scanoss/scanner.c', totalMatchedFiles: 12, identifiedFiles: 12, ignoredFiles: 1, source: 'engine' },
      { purl: 'pkg:github/scanoss/minr', totalMatchedFiles: 2, identifiedFiles: 0, ignoredFiles: 0, source: 'engine' },
      { purl: 'pkg:github/scanoss/scanoss.java', totalMatchedFiles: 1, identifiedFiles: 1, ignoredFiles: 0, source: 'engine' },
      { purl: 'test', totalMatchedFiles: 0, identifiedFiles: 1, ignoredFiles: 0, source: 'manual' },
    ],
    });

    const expectedOutput = {
      bom: {
        include: [
          {
            purl: 'pkg:github/scanoss/engine',
          },
          {
            purl: 'pkg:github/scanoss/scanner.c',
          },
          {
            purl: 'pkg:github/scanoss/scanoss.java',
          },
          {
            purl: 'test',
          },
        ],
        remove: [],
        replaced: [],
      },
    };
    const scanossJson = await scanossJsonFormat.generate();
    expect(scanossJson).toEqual(JSON.stringify(expectedOutput, null, 2));
    expect(JSON.parse(scanossJson).bom.remove.length).toEqual(0);
  });

  it('Should generate scanoss.json with populated remove and empty include arrays', async () => {
    exportRepositoryMock.setMockData({ scanossJsonComponentData: [
      { purl: 'pkg:github/scanoss/engine', totalMatchedFiles: 1, identifiedFiles: 0, ignoredFiles: 1, source: 'engine' },
      { purl: 'pkg:github/scanoss/scanner.c', totalMatchedFiles: 12, identifiedFiles: 0, ignoredFiles: 12, source: 'engine' },
      { purl: 'pkg:github/scanoss/minr', totalMatchedFiles: 2, identifiedFiles: 0, ignoredFiles: 2, source: 'engine' },
      { purl: 'pkg:github/scanoss/scanoss.java', totalMatchedFiles: 1, identifiedFiles: 0, ignoredFiles: 1, source: 'engine' },
    ],
    });

    const expectedOutput = {
      bom: {
        include: [],
        remove: [
          {
            purl: 'pkg:github/scanoss/engine',
          },
          {
            purl: 'pkg:github/scanoss/scanner.c',
          },
          {
            purl: 'pkg:github/scanoss/minr',
          },
          {
            purl: 'pkg:github/scanoss/scanoss.java',
          },
        ],
        replaced: [],
      },
    };
    const scanossJson = await scanossJsonFormat.generate();
    expect(scanossJson).toEqual(JSON.stringify(expectedOutput, null, 2));
    expect(JSON.parse(scanossJson).bom.include.length).toEqual(0);
  });

  it('Should generate a BOM with empty include and remove arrays', async () => {
    const expectedOutput = {
      bom: {
        include: [],
        remove: [],
        replaced: [],
      },
    };
    const scanossJson = await scanossJsonFormat.generate();
    expect(scanossJson).toEqual(JSON.stringify(expectedOutput, null, 2));
    expect(JSON.parse(scanossJson).bom.include.length).toEqual(0);
    expect(JSON.parse(scanossJson).bom.remove.length).toEqual(0);
  });

  it('Should create an entry in the replaced array', async () => {
    exportRepositoryMock.setMockData({ scanossJsonComponentData: [
      { purl: 'pkg:github/scanoss/engine', totalMatchedFiles: 1, identifiedFiles: 0, ignoredFiles: 1, source: 'engine' },
      { purl: 'pkg:github/scanoss/scanner.c', totalMatchedFiles: 12, identifiedFiles: 14, ignoredFiles: 1, source: 'engine' },
      { purl: 'pkg:github/scanoss/minr', totalMatchedFiles: 2, identifiedFiles: 0, ignoredFiles: 0, source: 'engine' },
      { purl: 'pkg:github/scanoss/scanoss.java', totalMatchedFiles: 1, identifiedFiles: 0, ignoredFiles: 1, source: 'engine' },
      { purl: 'test', totalMatchedFiles: 0, identifiedFiles: 1, ignoredFiles: 0, source: 'manual' },
    ],
    scanossJsonDetectedComponentData: [
      { paths: ['/external/inc/json.h', 'pkg:github/scanoss/scanner.c'],
        identified: 'pkg:github/scanoss/scanner.c',
        original: 'pkg:github/scanoss/minr',
      }],
    scanossJsonFileData: [
      { path: '/external/inc/json.h', purl: 'pkg:github/scanoss/scanner.c' },
    ],
    });

    const expectedOutput = { bom: {
      include: [
        {
          purl: 'pkg:github/scanoss/scanner.c',
        },
        {
          purl: 'test',
        },
      ],
      remove: [
        {
          purl: 'pkg:github/scanoss/engine',
        },
        {
          purl: 'pkg:github/scanoss/scanoss.java',
        },
        {
          path: '/external/inc/json.h',
          purl: 'pkg:github/scanoss/scanner.c',
        },
      ],
      replaced: [
        {
          paths: ['/external/inc/json.h', 'pkg:github/scanoss/scanner.c'],
          replaceWith: 'pkg:github/scanoss/scanner.c',
          purl: 'pkg:github/scanoss/minr',
        },
      ],
    },
    };

    const scanossJson = await scanossJsonFormat.generate();
    expect(scanossJson).toEqual(JSON.stringify(expectedOutput, null, 2));
  });
});
