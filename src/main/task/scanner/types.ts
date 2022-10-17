import { Project } from "main/workspace/Project";
import { ITask } from "../Task";

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
  }

  export interface IPipelineTask extends ITask<void, boolean> {
    getName(): string;
    isCritical(): boolean;
  }
}
