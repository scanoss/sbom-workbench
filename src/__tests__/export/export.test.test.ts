import { ExportSource } from '../../api/types';
import { ExportRepositoryMock } from './ExportRepositoryMock';
import { Settings } from '../../main/modules/export/format/Settings';

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
  let settingsFormat: Settings;
  let exportRepositoryMock: ExportRepositoryMock;
  // ...
  beforeEach(() => {
    exportRepositoryMock = new ExportRepositoryMock();
    settingsFormat = new Settings(ExportSource.IDENTIFIED, exportRepositoryMock);

    jest.clearAllMocks();
  });

  it('should generate a valid settings file', async () => {
    exportRepositoryMock.setMockData({ settingsComponentData: [
      { purl: 'pkg:github/scanoss/engine', totalMatchedFiles: 1, identifiedFiles: 0, ignoredFiles: 1, source: 'engine' },
      { purl: 'pkg:github/scanoss/scanner.c', totalMatchedFiles: 12, identifiedFiles: 12, ignoredFiles: 1, source: 'engine' },
      { purl: 'pkg:github/scanoss/minr', totalMatchedFiles: 2, identifiedFiles: 0, ignoredFiles: 0, source: 'engine' },
      { purl: 'pkg:github/scanoss/scanoss.java', totalMatchedFiles: 1, identifiedFiles: 0, ignoredFiles: 1, source: 'engine' },
      { purl: 'test', totalMatchedFiles: 0, identifiedFiles: 1, ignoredFiles: 0, source: 'manual' },
    ],
    settingsFileData: [
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
      replace: [],
    },
    };

    const scanossJson = await settingsFormat.generate();
    expect(scanossJson).toEqual(JSON.stringify(expectedOutput, null, 2));
  });

  it('Should generate settings file with populated include and empty remove arrays', async () => {
    exportRepositoryMock.setMockData({ settingsComponentData: [
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
        replace: [],
      },
    };
    const scanossJson = await settingsFormat.generate();
    expect(scanossJson).toEqual(JSON.stringify(expectedOutput, null, 2));
    expect(JSON.parse(scanossJson).bom.remove.length).toEqual(0);
  });

  it('Should generate settings file with populated remove and empty include arrays', async () => {
    exportRepositoryMock.setMockData({ settingsComponentData: [
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
        replace: [],
      },
    };
    const scanossJson = await settingsFormat.generate();
    expect(scanossJson).toEqual(JSON.stringify(expectedOutput, null, 2));
    expect(JSON.parse(scanossJson).bom.include.length).toEqual(0);
  });

  it('Should generate a seetings file with empty include and remove arrays', async () => {
    const expectedOutput = {
      bom: {
        include: [],
        remove: [],
        replace: [],
      },
    };
    const scanossJson = await settingsFormat.generate();
    expect(scanossJson).toEqual(JSON.stringify(expectedOutput, null, 2));
    expect(JSON.parse(scanossJson).bom.include.length).toEqual(0);
    expect(JSON.parse(scanossJson).bom.remove.length).toEqual(0);
  });

  it('Should create a settings file with an entry in the replaced array', async () => {
    exportRepositoryMock.setMockData({ settingsComponentData: [
      { purl: 'pkg:github/scanoss/engine', totalMatchedFiles: 1, identifiedFiles: 0, ignoredFiles: 1, source: 'engine' },
      { purl: 'pkg:github/scanoss/scanner.c', totalMatchedFiles: 12, identifiedFiles: 14, ignoredFiles: 1, source: 'engine' },
      { purl: 'pkg:github/scanoss/minr', totalMatchedFiles: 2, identifiedFiles: 0, ignoredFiles: 0, source: 'engine' },
      { purl: 'pkg:github/scanoss/scanoss.java', totalMatchedFiles: 1, identifiedFiles: 0, ignoredFiles: 1, source: 'engine' },
      { purl: 'test', totalMatchedFiles: 0, identifiedFiles: 1, ignoredFiles: 0, source: 'manual' },
    ],
    settingsDetectedComponentData: [
      { paths: ['/external/inc/json.h', 'pkg:github/scanoss/scanner.c'],
        identified: 'pkg:github/scanoss/scanner.c',
        original: 'pkg:github/scanoss/minr',
      }],
    settingsFileData: [
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
      replace: [
        {
          paths: ['/external/inc/json.h', 'pkg:github/scanoss/scanner.c'],
          replace_with: 'pkg:github/scanoss/scanner.c',
          purl: 'pkg:github/scanoss/minr',
        },
      ],
    },
    };

    const scanossJson = await settingsFormat.generate();
    expect(scanossJson).toEqual(JSON.stringify(expectedOutput, null, 2));
  });
});
