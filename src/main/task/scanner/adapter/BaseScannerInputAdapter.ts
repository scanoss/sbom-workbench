import { ScannerInput } from 'scanoss';
import { IScannerInputAdapter } from './IScannerInputAdapter';
import { Project } from '../../../workspace/Project';

type EngineFlags = {
  engineFlags?: number;
} | Record<string, never>;

export abstract class BaseScannerInputAdapter implements IScannerInputAdapter {
  protected project:Project;

  private readonly DOWNLOAD_URL_FLAG = 1024;

  protected getEngineFlags(): EngineFlags {
    if (this.project.getApiKey()) return { engineFlags: this.DOWNLOAD_URL_FLAG };
    return {};
  }

  public abstract adapterToScannerInput(filesToScan: Record<string, string>): Promise<Array<ScannerInput>>;
}
