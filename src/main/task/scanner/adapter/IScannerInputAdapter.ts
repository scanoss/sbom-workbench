import { ScannerInput } from 'scanoss';
import { Project } from '../../../workspace/Project';

export interface IScannerInputAdapter {
  adapterToScannerInput(project :Project,
    filesToScan: Record<string, string>) : Promise<Array<ScannerInput>>
}
