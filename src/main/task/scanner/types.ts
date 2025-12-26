import { ScannerStage } from '../../../api/types';
import { ITask } from '../Task';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Scanner {
  export enum ScannerMode {
    SCAN,
    RESCAN,
    RESUME,
  }

  export enum PipelineStage {
    CODE,
    DEPENDENCIES,
    VULNERABILITIES,
    UNZIP,
    CRYPTOGRAPHY,
    SEARCH_INDEX,
  }

  export enum ScannerSource {
    CODE,
    WFP,
    IMPORTED,
    IMPORTED_RESULTS_RAW
  }

  export interface ScannerConfig {
    mode?: ScannerMode;
    pipelineStages?: PipelineStage[];
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
