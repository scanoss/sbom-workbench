import { Leaf } from '../../../main/modules/export/format/Settings/identification-tree/leaf';
import { BomLeafProcessor } from '../../../main/modules/export/format/Settings/processors/bom-leaf-proccessor';
import { Folder } from '../../../main/modules/export/format/Settings/identification-tree/folder';
import { BomProcessor } from '../../../main/modules/export/format/Settings/processors/bom-processor';
import { Settings } from '../../../main/modules/export/format/Settings/Settings';
import { ExportRepositoryMock } from '../ExportRepositoryMock';
import { ExportSource } from '../../../api/types';

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

describe('export settings tests', () => {
  let settingsFormat: Settings;
  let exportRepositoryMock: ExportRepositoryMock;
  beforeEach(() => {
    exportRepositoryMock = new ExportRepositoryMock();
    settingsFormat = new Settings(ExportSource.IDENTIFIED, exportRepositoryMock);

    jest.clearAllMocks();
  });

  /** ************* Unit tests leaf processor ************** */

  it('Process a leaf node. Returns an sbom with include key.', async () => {
    const leaf = new Leaf('scanner.c', 'pkg:github/scanoss/scanner.c', 'pkg:github/scanoss/scanner.c', 1, 0);
    const bomLeafProccessor = new BomLeafProcessor();
    bomLeafProccessor.process(leaf);
    const bom = leaf.getBom();
    expect(bom).toEqual({
      include: [{ path: 'scanner.c', purl: 'pkg:github/scanoss/scanner.c' }],
      remove: [],
      replace: [],
    });
  });

  it('Process leaf node. Returns an sbom with remove key', async () => {
    const leaf = new Leaf('scanner.c', 'pkg:github/scanoss/scanner.c', 'pkg:github/scanoss/scanner.c', 0, 1);
    const bomLeafProccesor = new BomLeafProcessor();
    bomLeafProccesor.process(leaf);
    const bom = leaf.getBom();
    expect(bom).toEqual({
      include: [],
      remove: [{ path: 'scanner.c', purl: 'pkg:github/scanoss/scanner.c' }],
      replace: [],
    });
  });

  it('Process leaf node. Returns an sbom with replace key', async () => {
    const leaf = new Leaf('scanner.c', 'pkg:github/scanoss/scanner.c', 'pkg:github/scanoss/engine', 1, 0);
    const bomLeafProccessor = new BomLeafProcessor();
    bomLeafProccessor.process(leaf);
    const bom = leaf.getBom();
    expect(bom).toEqual({
      include: [],
      remove: [],
      replace: [{ paths: ['scanner.c'], purl: 'pkg:github/scanoss/scanner.c', replace_with: 'pkg:github/scanoss/engine' }],
    });
  });

  it('Process leaf node. Returns an sbom with include key from a no match file', async () => {
    const leaf = new Leaf('scanner.c', null, 'pkg:github/scanoss/scanner.c', 1, 0);
    const bomLeafProccessor = new BomLeafProcessor();
    bomLeafProccessor.process(leaf);
    const bom = leaf.getBom();
    expect(bom).toEqual({
      include: [{ path: 'scanner.c', purl: 'pkg:github/scanoss/scanner.c' }],
      remove: [],
      replace: [],
    });
  });

  it('Process leaf node. Returns an empty sbom', async () => {
    const leaf = new Leaf('scanner.c', null, 'pkg:github/scanoss/scanner.c', 0, 0);
    const bomLeafProccessor = new BomLeafProcessor();
    bomLeafProccessor.process(leaf);
    const bom = leaf.getBom();
    expect(bom).toEqual({
      include: [],
      remove: [],
      replace: [],
    });
  });

  /** ************* Unit tests folder processor ************** */
  it('Process folder node. Returns a bom with include key. All children were included. Path should be "src"', async () => {
    const folder = new Folder('src');
    const leaf1 = new Leaf('src/scanner.c', 'pkg:github/scanoss/scanner.c', 'pkg:github/scanoss/scanner.c', 1, 0);
    const leaf2 = new Leaf('src/utils.c', 'pkg:github/scanoss/scanner.c', 'pkg:github/scanoss/scanner.c', 1, 0);
    const leaf3 = new Leaf('src/scanner.h', 'pkg:github/scanoss/scanner.c', 'pkg:github/scanoss/scanner.c', 1, 0);

    folder.addChild(leaf1);
    folder.addChild(leaf2);
    folder.addChild(leaf3);

    const bomProcessor = new BomProcessor();
    const bom = folder.generateBom(bomProcessor);
    expect(bom).toEqual({
      include: [{ path: 'src', purl: 'pkg:github/scanoss/scanner.c' }],
      remove: [],
      replace: [],
    });
  });

  it('Process folder node. Returns a bom with remove key. All children were removed. Path should be "src', async () => {
    const folder = new Folder('src');
    const leaf1 = new Leaf('src/scanner.c', 'pkg:github/scanoss/scanner.c', 'pkg:github/scanoss/scanner.c', 0, 1);
    const leaf2 = new Leaf('src/utils.c', 'pkg:github/scanoss/scanner.c', 'pkg:github/scanoss/scanner.c', 0, 1);
    const leaf3 = new Leaf('src/scanner.h', 'pkg:github/scanoss/scanner.c', 'pkg:github/scanoss/scanner.c', 0, 1);

    folder.addChild(leaf1);
    folder.addChild(leaf2);
    folder.addChild(leaf3);

    const bomProcessor = new BomProcessor();
    const bom = folder.generateBom(bomProcessor);
    expect(bom).toEqual({
      include: [],
      remove: [{ path: 'src', purl: 'pkg:github/scanoss/scanner.c' }],
      replace: [],
    });
  });

  it('Process folder node. Returns a bom with replaced key, all children were replaced with the same purl and matched with the same purl.'
    + 'Path should be "src"', async () => {
    const folder = new Folder('src');
    const leaf1 = new Leaf('src/scanner.c', 'pkg:github/scanoss/scanner.c', 'pkg:github/scanoss/engine', 1, 0);
    const leaf2 = new Leaf('src/scanner.c', 'pkg:github/scanoss/scanner.c', 'pkg:github/scanoss/engine', 1, 0);
    const leaf3 = new Leaf('src/scanner.c', 'pkg:github/scanoss/scanner.c', 'pkg:github/scanoss/engine', 1, 0);

    folder.addChild(leaf1);
    folder.addChild(leaf2);
    folder.addChild(leaf3);

    const bomProcessor = new BomProcessor();
    const bom = folder.generateBom(bomProcessor);
    expect(bom).toEqual({
      include: [],
      remove: [],
      replace: [
        {
          paths: ['src'],
          purl: 'pkg:github/scanoss/scanner.c',
          replace_with: 'pkg:github/scanoss/engine',
        },
      ],
    });
  });

  it('Process folder node. Returns a bom file with include, remove and replace keys. All children have different decisions (1 include, 1 remove, 1 replace)'
    + 'Paths should not be sanitized', async () => {
    const folder = new Folder('src');
    const leaf1 = new Leaf('src/scanner.c', 'pkg:github/scanoss/scanner.c', 'pkg:github/scanoss/scanner.c', 1, 0); // Include
    const leaf2 = new Leaf('src/utils.c', 'pkg:github/scanoss/scanner.c', 'pkg:github/scanoss/engine', 0, 1); // Remove
    const leaf3 = new Leaf('src/scanner.h', 'pkg:github/scanoss/scanner.c', 'pkg:github/scanoss/engine', 1, 0); // Replace

    folder.addChild(leaf1);
    folder.addChild(leaf2);
    folder.addChild(leaf3);

    const bomProcessor = new BomProcessor();
    const bom = folder.generateBom(bomProcessor);
    expect(bom).toEqual({
      include: [
        {
          path: 'src/scanner.c',
          purl: 'pkg:github/scanoss/scanner.c',
        },
      ],
      remove: [
        {
          path: 'src/utils.c',
          purl: 'pkg:github/scanoss/scanner.c',
        },
      ],
      replace: [
        {
          paths: [
            'src/scanner.h',
          ],
          purl: 'pkg:github/scanoss/scanner.c',
          replace_with: 'pkg:github/scanoss/engine',
        },
      ],
    });
  });

  it('Process folder node. Returns a bom with include key.Path should be the "main" folder.', async () => {
    const mainFolder = new Folder('main');
    const leaf1 = new Leaf('main/winnowing.c', 'pkg:github/scanoss/scanner.c', 'pkg:github/scanoss/scanner.c', 1, 0); // Replace
    mainFolder.addChild(leaf1);

    const srcFolder = new Folder('main/src');
    const leaf2 = new Leaf('main/src/scanner.c', 'pkg:github/scanoss/scanner.c', 'pkg:github/scanoss/scanner.c', 1, 0); // Include
    const leaf3 = new Leaf('main/src/utils.c', 'pkg:github/scanoss/scanner.c', 'pkg:github/scanoss/scanner.c', 1, 0); // Remove
    const leaf4 = new Leaf('main/src/scanner.h', 'pkg:github/scanoss/scanner.c', 'pkg:github/scanoss/scanner.c', 1, 0); // Replace

    srcFolder.addChild(leaf2);
    srcFolder.addChild(leaf3);
    srcFolder.addChild(leaf4);
    mainFolder.addChild(srcFolder);

    const bomProcessor = new BomProcessor();
    const bom = mainFolder.generateBom(bomProcessor);
    expect(bom).toEqual({
      include: [{
        path: 'main',
        purl: 'pkg:github/scanoss/scanner.c',
      }],
      remove: [],
      replace: [],
    });
  });

  it('Returns a bom file with remove key. All children were removed. Path should be "main". 2 level folder', async () => {
    const mainFolder = new Folder('main');
    const leaf1 = new Leaf('main/winnowing.c', 'pkg:github/scanoss/scanner.c', 'pkg:github/scanoss/scanner.c', 0, 1); // Replace
    mainFolder.addChild(leaf1);

    const srcFolder = new Folder('main/src');
    const leaf2 = new Leaf('main/src/scanner.c', 'pkg:github/scanoss/scanner.c', 'pkg:github/scanoss/scanner.c', 0, 1); // Include
    const leaf3 = new Leaf('main/src/utils.c', 'pkg:github/scanoss/scanner.c', 'pkg:github/scanoss/scanner.c', 0, 1); // Remove
    const leaf4 = new Leaf('main/src/scanner.h', 'pkg:github/scanoss/scanner.c', 'pkg:github/scanoss/scanner.c', 0, 1); // Replace

    srcFolder.addChild(leaf2);
    srcFolder.addChild(leaf3);
    srcFolder.addChild(leaf4);
    mainFolder.addChild(srcFolder);

    const bomProcessor = new BomProcessor();
    const bom = mainFolder.generateBom(bomProcessor);
    expect(bom).toEqual({
      include: [],
      remove: [
        {
          path: 'main',
          purl: 'pkg:github/scanoss/scanner.c',
        },
      ],
      replace: [],
    });
  });

  it('Process folder node. Returns a bom file with replace key.All children were replaced with the same purl. Path should be "main". 2 folder level', async () => {
    const mainFolder = new Folder('main');
    const leaf1 = new Leaf('main/winnowing.c', 'pkg:github/scanoss/scanner.c', 'pkg:github/scanoss/engine', 1, 0); // Replace
    mainFolder.addChild(leaf1);

    const srcFolder = new Folder('main/src');
    const leaf2 = new Leaf('main/src/scanner.c', 'pkg:github/scanoss/scanner.c', 'pkg:github/scanoss/engine', 1, 0); // Include
    const leaf3 = new Leaf('main/src/utils.c', 'pkg:github/scanoss/scanner.c', 'pkg:github/scanoss/engine', 1, 0); // Remove
    const leaf4 = new Leaf('main/src/scanner.h', 'pkg:github/scanoss/scanner.c', 'pkg:github/scanoss/engine', 1, 0); // Replace

    srcFolder.addChild(leaf2);
    srcFolder.addChild(leaf3);
    srcFolder.addChild(leaf4);
    mainFolder.addChild(srcFolder);

    const bomProcessor = new BomProcessor();
    const bom = mainFolder.generateBom(bomProcessor);
    expect(bom).toEqual({
      include: [],
      remove: [],
      replace: [
        {
          paths: [
            'main',
          ],
          purl: 'pkg:github/scanoss/scanner.c',
          replace_with: 'pkg:github/scanoss/engine',
        },
      ],
    });
  });

  it('Process folder node. Bom folder processor with different child identifications(1 include, 2 remove, 1 replace). 2 folder level', async () => {
    const mainFolder = new Folder('main');
    const leaf1 = new Leaf('main/winnowing.c', 'pkg:github/scanoss/scanner.c', 'pkg:github/scanoss/engine', 0, 1); // Remove
    mainFolder.addChild(leaf1);

    const srcFolder = new Folder('main/src');
    const leaf2 = new Leaf('main/src/scanner.c', 'pkg:github/scanoss/scanner.c', 'pkg:github/scanoss/engine', 1, 0); // Replace
    const leaf3 = new Leaf('main/src/utils.c', 'pkg:github/scanoss/scanner.c', 'pkg:github/scanoss/scanner.c', 1, 0); // Include
    const leaf4 = new Leaf('main/src/scanner.h', 'pkg:github/scanoss/scanner.c', 'pkg:github/scanoss/engine', 0, 1); // Remove

    srcFolder.addChild(leaf2);
    srcFolder.addChild(leaf3);
    srcFolder.addChild(leaf4);
    mainFolder.addChild(srcFolder);

    const bomProcessor = new BomProcessor();
    const bom = mainFolder.generateBom(bomProcessor);
    expect(bom).toEqual({
      include: [
        {
          path: 'main/src/utils.c',
          purl: 'pkg:github/scanoss/scanner.c',
        },
      ],
      remove: [
        {
          path: 'main/winnowing.c',
          purl: 'pkg:github/scanoss/scanner.c',
        },
        {
          path: 'main/src/scanner.h',
          purl: 'pkg:github/scanoss/scanner.c',
        },
      ],
      replace: [
        {
          paths: [
            'main/src/scanner.c',
          ],
          purl: 'pkg:github/scanoss/scanner.c',
          replace_with: 'pkg:github/scanoss/engine',
        },
      ],
    });
  });

  /** ************* Integration tests ************** */
  it('Returns an sbom file with include remove and replace keys based on input decision data', async () => {
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
      {
        identifiedAs: 'pkg:github/scanoss/engine',
        original: 'pkg:github/scanoss/scanner.c',
        path: 'inc/utils.c',
        type: 'FILTERED',
        identified: 1,
        ignored: 0,
      },
    ]);
    settingsFormat = new Settings(ExportSource.IDENTIFIED, exportRepositoryMock);
    const settings = await settingsFormat.generate();
    console.log(settings);
    expect(JSON.parse(settings)).toEqual({
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
              'inc',
            ],
            purl: 'pkg:github/scanoss/scanner.c',
            replace_with: 'pkg:github/scanoss/engine',
          },
        ],
      },
    });
  });
});
