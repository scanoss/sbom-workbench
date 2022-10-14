import { INewProject } from '@api/types';
import { Project } from '../../workspace/Project';

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
    project?: INewProject;
  }
}
