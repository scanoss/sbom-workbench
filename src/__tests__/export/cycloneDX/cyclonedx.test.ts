import { ExportRepositoryMock } from '../ExportRepositoryMock';
import { CycloneDXIdentified } from '../../../main/modules/export/format/CycloneDX/CycloneDXIdentified';
import { CycloneDXDetected } from '../../../main/modules/export/format/CycloneDX/CycloneDXDetected';
import { Project } from '../../../main/workspace/Project';

jest.mock('electron', () => ({
  app: {
    getPath: jest.fn(() => '/mock/path'),
    getName: jest.fn(() => 'MockAppName'),
    getVersion: jest.fn(() => '1.0.0'),
    isPackaged: false,
  },
  ipcMain: {
    on: jest.fn(),
    send: jest.fn(),
  },
}));

jest.mock('electron-log', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));

describe('CycloneDX tests', () => {
  let exportRepositoryMock: ExportRepositoryMock;
  beforeEach(() => {
    exportRepositoryMock = new ExportRepositoryMock();
  });

  it('CycloneDX identified test', async () => {
    const formatter = new CycloneDXIdentified(new Project('test project'), exportRepositoryMock);
    const { report } = await formatter.generate();
    const bom = JSON.parse(report);

    const purls = bom.components.map((c) => c.purl);

    // A manually identified file with no scan match (no-match/filtered) still appears as a
    // component, keyed by its concluded PURL.
    const noMatch = bom.components.find((c) => c.purl === 'pkg:github/scanoss/scanner.c');
    expect(noMatch).toBeDefined();
    expect(noMatch.version).toEqual('v1.3.3');
    expect(noMatch.licenses.some((l) => l.license?.id === 'GPL-2.0-only')).toBe(true);

    // The detected components are also present.
    expect(purls).toContain('pkg:github/gentoo/gentoo');
  });

  it('CycloneDX detected test', async () => {
    const formatter = new CycloneDXDetected(new Project('test project'), exportRepositoryMock);
    const { report } = await formatter.generate();
    const bom = JSON.parse(report);

    const purls = bom.components.map((c) => c.purl);
    expect(purls).toContain('pkg:github/gentoo/gentoo');
    expect(purls).toContain('pkg:github/ibm-openbmc/openbmc');
  });
});
