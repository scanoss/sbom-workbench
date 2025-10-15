import { SbomMode, ScannerInput, WinnowingMode } from 'scanoss';
import fs from 'fs';
import log from 'electron-log';
import path from 'path';
import { getSettingsFileInfo } from '../../../services/utils/workspace';
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

    const settingsFileInfo = await getSettingsFileInfo(rootPath);
    if (settingsFileInfo.type === 'standard' && settingsFileInfo.fileName) {
      try {
        log.info('[ SCAN ] - Loading scanoss.json file');
        const absoluteScanossSettingsPath = path.join(rootPath, settingsFileInfo.fileName);
        const scanossSettings = JSON.parse(await fs.promises.readFile(absoluteScanossSettingsPath, 'utf8'));
        result.forEach((_, index, arr) => {
          arr[index].settings = scanossSettings;
        });
        return result;
      }catch (e) {
        log.error(`[CODE SCANNER INPUT ADAPTER]: Invalid context file: ${path.join(rootPath, settingsFileInfo.fileName)}`, e);
        throw new Error(`Invalid contextFile ${path.join(rootPath, settingsFileInfo.fileName)}`);
      }
    }

    if (settingsFileInfo.type === 'legacy' && settingsFileInfo.fileName) {
      try {
        const sbom = fs.readFileSync(path.join(rootPath,settingsFileInfo.fileName), 'utf-8');
        const sbomMode = settingsFileInfo.legacyType == "identify" ? SbomMode.SBOM_IDENTIFY : SbomMode.SBOM_IGNORE;

        JSON.parse(sbom);

        result.forEach((_, index, arr) => {
          arr[index].sbom = sbom;
          arr[index].sbomMode = sbomMode;
        });

      } catch (e) {
        log.error(`[CODE SCANNER INPUT ADAPTER]: Invalid legacy settings file: '${path.join(rootPath,settingsFileInfo.fileName)}'`, e);
        throw new Error(`Invalid legacy settings file '${path.join(rootPath,settingsFileInfo.fileName)}'`);
      }
    }

    return result;
  }
}
