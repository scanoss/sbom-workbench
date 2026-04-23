/**
 * Minimal Project / Metadata stubs for driving CodeScannerPipelineTask
 * (or any other ScannerPipeline) against a tmp project directory in
 * integration tests.
 *
 * Only the surface area the pipeline reads is implemented. Anything outside
 * scope (UI broadcasts, snapshot persistence, peripheral tasks not enabled
 * via pipelineStages) is a `jest.fn()` no-op or returns a sensible default.
 */

import { join } from 'path';
import { Scanner } from '../../../main/task/scanner/types';

export interface MakeTestProjectOpts {
  projectDir: string;
  mode?: Scanner.ScannerMode;
  source?: Scanner.ScannerSource;
  pipelineStages?: Scanner.PipelineStage[];
  obfuscate?: boolean;
  hpsm?: boolean;
  allExtensions?: boolean;
}

export function makeTestProject(opts: MakeTestProjectOpts): any {
  const {
    projectDir,
    mode = Scanner.ScannerMode.SCAN,
    source = Scanner.ScannerSource.CODE,
    pipelineStages = [Scanner.PipelineStage.CODE],
    obfuscate = false,
    hpsm = false,
    allExtensions = true,
  } = opts;
  const sourceDir = join(projectDir, 'source');

  // Single mutable scanner config so tests can flip individual fields
  // (typically `mode`) between scans without rebuilding the project.
  const scannerConfig: Scanner.ScannerConfig = {
    mode,
    source,
    pipelineStages,
    obfuscate,
    hpsm,
    allExtensions,
  };

  const metadata = {
    getName: () => 'test-project',
    getMyPath: () => projectDir,
    getScanRoot: () => sourceDir,
    getWorkRoot: () => projectDir,
    getVersion: () => '1.0.0',
    getApi: () => '',
    getApiKey: () => '',
    getScannerConfig: () => scannerConfig,
    setSource: jest.fn(),
    setScannerState: jest.fn(),
    setFileCounter: jest.fn(),
    save: jest.fn(),
  };

  const project: any = {
    metadata,
    scanner: null as any,
    tree: undefined as any,
    filesToScan: {},
    filesNotScanned: {},
    filesSummary: { include: 0, total: 0, filter: 0 },
    processedFiles: 0,

    getMyPath: () => projectDir,
    getScanRoot: () => sourceDir,
    getApi: () => '',
    getApiKey: () => '',
    getDto: () => ({ scannerConfig: { obfuscate, hpsm } }),
    getTree() { return this.tree; },
    setTree(t: any) { this.tree = t; },

    save: jest.fn(),
    saveWithSnapshot: jest.fn(),
    close: jest.fn(async () => undefined),
    open: jest.fn(async () => undefined),
    upgrade: jest.fn(async () => '1.0.0'),
  };

  return project;
}
