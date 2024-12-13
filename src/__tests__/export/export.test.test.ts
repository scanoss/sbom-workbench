import { ExportSource } from '../../api/types';
import { ExportRepositoryMock } from './ExportRepositoryMock';
import { Settings } from '../../main/modules/export/format/Settings/Settings';

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
    exportRepositoryMock.setDecisionMockData([
      {
        identifiedAs: 'pkg:github/scanoss/engine',
        original: 'pkg:github/scanoss/scanner.c',
        path: '.git/external/applypatch-msg.sample',
        type: 'FILTERED',
        identified: 0,
        ignored: 1,
      },
      {
        identifiedAs: 'pkg:github/scanoss/scanner.c',
        original: 'pkg:github/scanoss/scanner.c',
        path: '.git/spdx.json',
        type: 'FILTERED',
        identified: 1,
        ignored: 0,
      },
      {
        identifiedAs: 'pkg:github/scanoss/engine',
        original: 'pkg:github/scanoss/scanner.c',
        path: '.git/hooks/commit-msg.sample',
        type: 'FILTERED',
        identified: 1,
        ignored: 0,
      },
      {
        identifiedAs: 'pkg:github/scanoss/engine',
        original: 'pkg:github/scanoss/scanner.c',
        path: '.git/hooks/fsmonitor-watchman.sample',
        type: 'MATCH',
        identified: 1,
        ignored: 0,
      },
      {
        identifiedAs: 'pkg:github/scanoss/engine',
        original: 'pkg:github/scanoss/scanner.c',
        path: '.git/hooks/scanner.c',
        type: 'MATCH',
        identified: 1,
        ignored: 0,
      },
      {
        identifiedAs: 'pkg:github/scanoss/engine',
        original: 'pkg:github/scanoss/scanner.c',
        path: 'status.md',
        type: 'FILTERED',
        identified: 0,
        ignored: 1,
      },
    ]);
    settingsFormat = new Settings(ExportSource.IDENTIFIED, exportRepositoryMock);
    const settings = await settingsFormat.generate();


    expect(JSON.parse(JSON.stringify(settings))).toEqual({
      bom: {
        include: [
          {
            path: '.git/spdx.json',
            purl: 'pkg:github/scanoss/scanner.c',
          },
        ],
        remove: [
          {
            path: '.git/external',
            purl: 'pkg:github/scanoss/scanner.c',
          },
          {
            path: 'status.md',
            purl: 'pkg:github/scanoss/scanner.c',
          },
        ],
        replace: [
          {
            paths: [
              '.git/hooks',
            ],
            purl: 'pkg:github/scanoss/scanner.c',
            replace_with: 'pkg:github/scanoss/engine',
          },
        ],
      },
    });
  });
});
