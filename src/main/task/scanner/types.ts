import { ScannerStage } from '../../../api/types';
import { ITask } from '../Task';

export interface StageReportEntry {
  item: string;
  message: string;
  severity?: 'error' | 'warning' | 'info';
}

/**
 * Represents a collection of messages from a pipeline stage reported to the user
 * at the end of a scan.
 */
export interface StageReport {
  title: string;
  stage: ScannerStage;
  entries: StageReportEntry[];
}

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
    allExtensions?: boolean;
  }

  export interface StageProperties {
    name: ScannerStage;
    label: string;
    isCritical: boolean;
    stageReport?: StageReport;
  }

  export interface IPipelineTask extends ITask<void, boolean> {
    getStageProperties(): StageProperties;
  }
}
