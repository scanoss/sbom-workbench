import { SbomMode, ScannerInput, WinnowingMode } from 'scanoss';
import fs from 'fs';
import log from 'electron-log';
import path from 'path';
import {
  getContextFiles,
  getScanossSettingsFilePath,
} from '../../../services/utils/workspace';
import { IScannerInputAdapter } from './IScannerInputAdapter';
import { BaseScannerInputAdapter } from './BaseScannerInputAdapter';
import { Project } from '../../../workspace/Project';

export class CodeScannerInputAdapter extends BaseScannerInputAdapter implements IScannerInputAdapter {
  constructor(project:Project) {
    super();
    this.project = project;
  }

  async adapterToScannerInput(filesToScan: Record<string, string>): Promise<Array<ScannerInput>> {
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
        ...this.getEngineFlags(),
        fileList: fullScanList,
        folderRoot: this.project.metadata.getScanRoot(),
        winnowing: {
          mode: this.project.getDto().scannerConfig.hpsm ? WinnowingMode.FULL_WINNOWING_HPSM : WinnowingMode.FULL_WINNOWING,
        },
      });
    }

    if (quickScanList.length > 0) {
      result.push({
        ...this.getEngineFlags(),
        fileList: quickScanList,
        folderRoot: this.project.metadata.getScanRoot(),
        winnowing: { mode: WinnowingMode.WINNOWING_ONLY_MD5 },
      });
    }

    // Allows to ignore a list of components from a SBOM place in the root folder
    const rootPath = this.project.getScanRoot();

    const scanossSettingsPath = await getScanossSettingsFilePath(rootPath);
    if (scanossSettingsPath) {
      try {
        log.info('[ SCAN ] - Loading scanoss.json file');
        const absoluteScanossSettingsPath = path.join(rootPath, scanossSettingsPath);
        const scanossSettings = JSON.parse(await fs.promises.readFile(absoluteScanossSettingsPath, 'utf8'));
        result.forEach((_, index, arr) => {
          arr[index].settings = scanossSettings;
        });
        return result;
      }catch (e) {
        log.error(`[CODE SCANNER INPUT ADAPTER]: Invalid context file: ${path.join(rootPath, scanossSettingsPath)}`, e);
        throw new Error(`Invalid contextFile ${path.join(rootPath, scanossSettingsPath)}`);
      }
    }

    // Legacy
    let sbom = '';
    let sbomMode = SbomMode.SBOM_IDENTIFY;

    const contextFiles = await getContextFiles(rootPath);

    if (contextFiles.ignoreFile) {
      try {
        sbom = fs.readFileSync(path.join(rootPath,contextFiles.ignoreFile), 'utf-8');
        JSON.parse(sbom);
        log.error(`Invalid contextFile ${contextFiles.ignoreFile}`);
        sbomMode = SbomMode.SBOM_IGNORE;
      } catch (e) {
        log.error(`[CODE SCANNER INPUT ADAPTER]: Invalid context file: '${path.join(rootPath,contextFiles.ignoreFile)}'`, e);
        throw new Error(`Invalid contextFile '${path.join(rootPath,contextFiles.ignoreFile)}'`);
      }
    }

    if (contextFiles.identifyFile) {
      try {
        sbom = fs.readFileSync(path.join(rootPath,contextFiles.identifyFile), 'utf-8');
        JSON.parse(sbom);
        sbomMode = SbomMode.SBOM_IDENTIFY;
      }catch (e) {
        log.error(`[CODE SCANNER INPUT ADAPTER]: Invalid context file: ${path.join(rootPath,contextFiles.identifyFile)}'`, e);
        throw new Error(`Invalid contextFile '${path.join(rootPath,contextFiles.identifyFile)}'`);
      }
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
