import { ScannerInput } from 'scanoss';
import { Project } from '../../../workspace/Project';

export interface IScannerInputAdapter {
  adapterToScannerInput(filesToScan: Record<string, string>) : Promise<Array<ScannerInput>>
}
