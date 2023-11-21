import { SbomMode, ScannerInput, WinnowingMode } from 'scanoss';
import fs from 'fs';
import { IScannerInputAdapter } from './IScannerInputAdapter';
import { Project } from '../../../workspace/Project';

export class CodeScannerInputAdapter implements IScannerInputAdapter {
  adapterToScannerInput(project: Project, filesToScan: Record<string, string>): Array<ScannerInput> {
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
    const rootFolder = project.getTree().getRootFolder();
    const rootPath = project.getScanRoot();

    let sbom = '';
    let sbomMode = SbomMode.SBOM_IDENTIFY;

    if (rootFolder.containsFile('scanoss-ignore.json')) {
      sbom = fs.readFileSync(`${rootPath}/scanoss-ignore.json`, 'utf-8');
      sbomMode = SbomMode.SBOM_IGNORE;
    }

    if (rootFolder.containsFile('scanoss-identify.json')) {
      sbom = fs.readFileSync(`${rootPath}/scanoss-identify.json`, 'utf-8');
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
