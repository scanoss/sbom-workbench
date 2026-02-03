import { ScannerStage } from '../../../api/types';
import { ITask } from '../Task';

/**
 * Represents an individual error for a specific file or purl within a pipeline stage
 */
export interface StageItemError {
  /** The affected file path or purl */
  item: string;
  /** Error message describing what went wrong */
  message: string;
}

/**
 * Represents a collection of non-critical errors from a pipeline stage
 * These errors don't stop the scan but should be reported to the user at the end
 */
export interface StageWarning {
  /** Display title for the warning (e.g., "Dependency Analysis") */
  title: string;
  /** The stage that generated these warnings */
  stage: ScannerStage;
  /** List of individual errors with affected items */
  errors: StageItemError[];
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
  }

  export interface StageProperties {
    name: ScannerStage;
    label: string;
    isCritical: boolean;
    warnings?: StageWarning;
  }

  export interface IPipelineTask extends ITask<void, boolean> {
    getStageProperties(): StageProperties;
  }
}
