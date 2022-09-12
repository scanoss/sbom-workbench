import { INewProject } from '@api/types';

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
  }

  export enum ScannerSource {
    CODE,
    WFP,
    IMPORTED,
  }

  export interface ScannerConfig {
    mode: ScannerMode;
    type?: ScannerType[],
    source?: ScannerSource,
    project?: INewProject;
    projectPath?: string; // TODO: Remove projectPath for re-scan
  }
}
