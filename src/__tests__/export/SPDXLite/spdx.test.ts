import { ExportRepositoryMock } from '../ExportRepositoryMock';
import { SpdxLiteIdentified } from '../../../main/modules/export/format/SPDXLite/SpdxLiteIdentified';
import { Project } from '../../../main/workspace/Project';
import { SpdxLiteDetected } from '../../../main/modules/export/format/SPDXLite/SpdxLiteDetected';
import AppConfig from '@config/AppConfigModule';

// Mock crypto first
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: (arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
  },
});

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

describe('SPDX Lite tests', () => {
  let exportRepositoryMock: ExportRepositoryMock;
  beforeEach(() => {
    exportRepositoryMock = new ExportRepositoryMock();
  });

  it('SPDX Lite detected test', async () => {
    const spdxLiteFormatter = new SpdxLiteDetected(new Project('test project'), exportRepositoryMock);
    const spdxLiteString = await spdxLiteFormatter.generate();
    const spdxLite: SPDXDocument = JSON.parse(spdxLiteString);
    const uniqueExtractedLicensingInfos = new Set([
      'LicenseRef-scancode-unknown-license-reference',
      'LicenseRef-sspl',
      'LicenseRef-scancode-other-copyleft',
      'LicenseRef-scancode-warranty-disclaimer',
      'LicenseRef-gpl-2.0-only-with-linux-syscall-note',
      'LicenseRef-scancode-flex-2.5']);

    expect(spdxLite.spdxVersion).toEqual('SPDX-2.2');
    expect(spdxLite.SPDXID).toEqual('SPDXRef-DOCUMENT');
    expect(spdxLite.name).toEqual('SBOM for test project');
    expect(spdxLite.creationInfo.creators[0].includes(`Tool: ${AppConfig.APP_NAME}`)).toBe(true);
    expect(spdxLite.creationInfo.creators[2]).toEqual(`Organization: ${AppConfig.ORGANIZATION_NAME}`);
    expect(spdxLite.creationInfo.comment).toEqual('SBOM Build information - SBOM Type: Build');
    expect(spdxLite.documentDescribes.length).toEqual(2);

    spdxLite.packages.forEach((pkg) => {
      pkg.checksums.forEach((checksum) => {
        expect(checksum.algorithm).toEqual('MD5');
        expect(checksum.checksumValue).not.toBeNull();
      });
    });

    spdxLite.hasExtractedLicensingInfos.forEach((li) => {
      expect(uniqueExtractedLicensingInfos.has(li.licenseId)).toBe(true);
    });
  });

  it('SPDX Lite identified test', async () => {
    const spdxLiteFormatter = new SpdxLiteIdentified(new Project('test project'), exportRepositoryMock);
    const spdxLiteString = await spdxLiteFormatter.generate();
    const spdxLite: SPDXDocument = JSON.parse(spdxLiteString);
    const uniqueExtractedLicensingInfos = new Set([
      'LicenseRef-scancode-unknown-license-reference',
      'LicenseRef-sspl',
      'LicenseRef-scancode-other-copyleft',
      'LicenseRef-scancode-warranty-disclaimer',
      'LicenseRef-gpl-2.0-only-with-linux-syscall-note',
      'LicenseRef-scancode-flex-2.5']);

    expect(spdxLite.spdxVersion).toEqual('SPDX-2.2');
    expect(spdxLite.SPDXID).toEqual('SPDXRef-DOCUMENT');
    expect(spdxLite.name).toEqual('SBOM for test project');
    expect(spdxLite.creationInfo.creators[0].includes(`Tool: ${AppConfig.APP_NAME}`)).toBe(true);
    expect(spdxLite.creationInfo.creators[2]).toEqual(`Organization: ${AppConfig.ORGANIZATION_NAME}`);
    expect(spdxLite.creationInfo.comment).toEqual('SBOM Build information - SBOM Type: Build');
    expect(spdxLite.documentDescribes.length).toEqual(2);

    expect(spdxLite.packages[0].versionInfo).toEqual('1.2.0');
    expect(spdxLite.packages[1].licenseConcluded).toEqual('Beerware');

    // check if right download location is set when no download location is coming from the engine
    expect(spdxLite.packages[0].downloadLocation).toEqual('https://github.com/gentoo/gentoo');
    // check if right download location is set when download location is coming from the engine
    expect(spdxLite.packages[1].downloadLocation).toEqual('https://github.com/gentoo/gentoo/archive/53bd330.zip');

    // Check if default MD5 hash is custom components
    expect(spdxLite.packages[0].checksums[0].checksumValue).toEqual('0'.repeat(32));

    spdxLite.packages.forEach((pkg) => {
      pkg.checksums.forEach((checksum) => {
        expect(checksum.algorithm).toEqual('MD5');
        expect(checksum.checksumValue).not.toBeNull();
      });
    });

    spdxLite.hasExtractedLicensingInfos.forEach((li) => {
      expect(uniqueExtractedLicensingInfos.has(li.licenseId)).toBe(true);
    });
  });
});
