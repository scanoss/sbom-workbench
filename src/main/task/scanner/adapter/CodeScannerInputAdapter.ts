import { SbomMode, ScannerInput, WinnowingMode } from 'scanoss';
import fs from 'fs';
import log from 'electron-log';
import {
  getContextFiles,
  getScanossSettingsFilePath,
} from '../../../services/utils/workspace';
import { IScannerInputAdapter } from './IScannerInputAdapter';
import { Project } from '../../../workspace/Project';
import path from 'path';

export class CodeScannerInputAdapter implements IScannerInputAdapter {
  async adapterToScannerInput(project: Project, filesToScan: Record<string, string>): Promise<Array<ScannerInput>> {
    const fullScanList: Array<string> = [];
    const quickScanList: Array<string> = [];

    for (const filePath of Object.keys(filesToScan)) {
      if (filesToScan[filePath] === 'MD5_SCAN') {
        quickScanList.push(filePath);
      } else {
        fullScanList.push(filePath);
      }
    }

    const result: Array<ScannerInput> = [];

    if (fullScanList.length > 0) {
      result.push({
        fileList: fullScanList,
        folderRoot: project.metadata.getScanRoot(),
        winnowing: {
          mode: project.getDto().scannerConfig.hpsm ? WinnowingMode.FULL_WINNOWING_HPSM : WinnowingMode.FULL_WINNOWING,
        },
      });
    }

    if (quickScanList.length > 0) {
      result.push({
        fileList: quickScanList,
        folderRoot: project.metadata.getScanRoot(),
        winnowing: { mode: WinnowingMode.WINNOWING_ONLY_MD5 },
      });
    }

    // Allows to ignore a list of components from a SBOM place in the root folder
    const rootPath = project.getScanRoot();

    const scanossSettingsPath = await getScanossSettingsFilePath(rootPath);
    if (scanossSettingsPath) {
      log.info('[ SCAN ] - Loading scanoss.json file');
      const scanossSettings = JSON.parse(await fs.promises.readFile(path.join(rootPath, scanossSettingsPath), 'utf8'));
      result.forEach((_, index, arr) => {
        arr[index].settings = scanossSettings;
        arr[index].sbomMode = SbomMode.SBOM_IDENTIFY;
      });
      return result;
    }

    let sbom = '';
    let sbomMode = SbomMode.SBOM_IDENTIFY;

    const contextFiles = await getContextFiles(rootPath);

    if (contextFiles.ignoreFile) {
      sbom = fs.readFileSync(`${rootPath}/${contextFiles.identifyFile}`, 'utf-8');
      sbomMode = SbomMode.SBOM_IGNORE;
    }

    if (contextFiles.identifyFile) {
      sbom = fs.readFileSync(`${rootPath}/${contextFiles.identifyFile}`, 'utf-8');
      sbomMode = SbomMode.SBOM_IDENTIFY;
    }

    if (sbom.length) {
      result.forEach((_, index, arr) => {
        arr[index].sbom = sbom;
        arr[index].sbomMode = sbomMode;
      });
    }
    return result;
  }
}
