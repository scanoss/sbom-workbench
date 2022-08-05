import { INewProject } from '@api/types';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Scanner {
  export enum ScannerType {
    SCAN,
    RESCAN,
  }

  export interface ScannerConfig {
    type: ScannerType;
    project?: INewProject;
    projectPath?: string; // TODO: Remove projectPath for re-scan
  }
}
