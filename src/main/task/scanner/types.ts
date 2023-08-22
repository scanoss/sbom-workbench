import { ScannerStage } from '../../../api/types';
import { ITask } from '../Task';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Scanner {
  export enum ScannerMode {
    SCAN,
    RESCAN,
    RESUME,
  }

  export enum ScannerType {
    CODE,
    DEPENDENCIES,
    VULNERABILITIES,
    UNZIP,
  }

  export enum ScannerSource {
    CODE,
    WFP,
    IMPORTED,
  }

  export interface ScannerConfig {
    mode?: ScannerMode;
    type?: ScannerType[];
    source?: ScannerSource;
    obfuscate?: boolean;
    hpsm?: boolean;
  }

  export interface StageProperties {
    name: ScannerStage;
    label: string;
    isCritical: boolean;
  }

  export interface IPipelineTask extends ITask<void, boolean> {
    getStageProperties(): StageProperties;
  }
}
