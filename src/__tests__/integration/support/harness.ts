/**
 * Integration test harness.
 *
 * Imported by every integration test. Loads ./mocks (which registers the
 * Electron / scanoss / broadcastManager / userSettingService stubs) before
 * any production module is required, then exposes:
 *
 *   - context factory       : createTestContext()
 *   - scanner control       : mockScanResults, COMPONENTS
 *   - re-exported services  : fileService, inventoryService, resultService,
 *                             componentService, rescanService
 *   - re-exported namespace : Scanner (for ScannerMode / PipelineStage)
 *
 * Test files instantiate one (or more) TestContext per test, get all the
 * paths and helpers off it, and call ctx.destroy() in afterEach.
 *
 *   import { createTestContext, mockScanResults, COMPONENTS, Scanner,
 *            fileService, inventoryService, resultService } from './support/harness';
 *
 *   let ctx;
 *   beforeEach(async () => { ctx = await createTestContext(); });
 *   afterEach(async () => { await ctx.destroy(); });
 *
 *   it('...', async () => {
 *     ctx.writeSourceFiles({ '/src/main/app.ts': '// content' });
 *     const project = ctx.makeProject({ mode: Scanner.ScannerMode.SCAN });
 *     mockScanResults({ '/src/main/app.ts': COMPONENTS.sbomWorkbench });
 *     await ctx.runPipeline(project);
 *   });
 */

// Side-effect: registers all jest.mock() calls. Must come before any import
// that pulls in production modules.
import './mocks';

import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { dirname, join } from 'path';
import { randomBytes, createHash } from 'crypto';

import {
  setSpecForDir, clearSpecForDir, setCurrentWorkDir, resetScannerMockCalls,
  ScanSpec,
} from './mocks';
import { COMPONENTS } from './components';
import { makeTestProject } from './project-stub';
import { modelProvider } from '../../../main/services/ModelProvider';
import { fileService } from '../../../main/services/FileService';
import { resultService } from '../../../main/services/ResultService';
import { componentService } from '../../../main/services/ComponentService';
import { inventoryService } from '../../../main/services/InventoryService';
import { rescanService } from '../../../main/services/RescanService';
import { ScannerPipelineFactory } from '../../../main/task/scanner/scannerPipelineFactory/ScannerPipelineFactory';
import { Scanner } from '../../../main/task/scanner/types';

// Re-export services + helpers for convenient access from test files.
export {
  fileService,
  inventoryService,
  resultService,
  componentService,
  rescanService,
  COMPONENTS,
  Scanner,
};

/**
 * Generate `sizeBytes` of random hex content. Default 1 KB — large enough
 * to bypass Tree's MIN_FILE_SIZE filter (256 bytes) so the file makes it
 * into the indexed tree.
 */
export function randomFileContent(sizeBytes = 1024): string {
  // hex doubles the byte count → halve the input
  return randomBytes(Math.ceil(sizeBytes / 2)).toString('hex').slice(0, sizeBytes);
}

/** MD5 hash of a UTF-8 string. Matches what the tree-build step stores in files.md5_file. */
export function md5(content: string): string {
  return createHash('md5').update(content).digest('hex');
}

/** Sentinel for ctx.mockScanResults meaning "the engine returned no match for this path". */
export const NO_MATCH = 'none' as const;

// --- TestContext -----------------------------------------------------------

export interface TestContext {
  readonly projectDir: string;
  readonly sourceDir: string;

  /** Write source files relative to sourceDir. Path keys can start with `/` or not. */
  writeSourceFiles(files: Record<string, string>): void;

  /** Delete a source file (leading `/` accepted). */
  deleteSourceFile(path: string): void;

  /** Build a Project stub bound to this context's projectDir. */
  makeProject(opts?: {
    mode?: Scanner.ScannerMode;
    source?: Scanner.ScannerSource;
    pipelineStages?: Scanner.PipelineStage[];
    obfuscate?: boolean;
    hpsm?: boolean;
    allExtensions?: boolean;
  }): any;

  /** Configure what the (mocked) engine will return for the next scan in this ctx. */
  mockScanResults(spec: ScanSpec): void;

  /** Run the production CodeScannerPipelineTask against the given project. */
  runPipeline(project: any): Promise<boolean>;

  /** Tear down the DB connection and remove the project directory. */
  destroy(): Promise<void>;
}

/**
 * Create an isolated test context: a fresh tmp project directory, a clean
 * SQLite DB initialized via modelProvider.init, and helpers bound to it.
 *
 * Tests typically call this once per test from beforeEach, but a test can
 * legitimately create multiple contexts (e.g. to verify isolation between
 * two simultaneous projects).
 */
export async function createTestContext(): Promise<TestContext> {
  const projectDir = mkdtempSync(join(tmpdir(), 'sbom-int-'));
  const sourceDir = join(projectDir, 'source');
  mkdirSync(sourceDir, { recursive: true });

  // The scanoss mock writes result.json into the work dir set on the
  // Scanner instance. The pipeline calls setWorkDirectory(getMyPath()), so
  // this seed only matters if a test invokes the mock directly.
  setCurrentWorkDir(projectDir);
  resetScannerMockCalls();

  await modelProvider.init(projectDir);

  function writeSourceFiles(files: Record<string, string>): void {
    for (const [path, content] of Object.entries(files)) {
      const relPath = path.startsWith('/') ? path.slice(1) : path;
      const fullPath = join(sourceDir, relPath);
      mkdirSync(dirname(fullPath), { recursive: true });
      writeFileSync(fullPath, content);
    }
  }

  function deleteSourceFile(path: string): void {
    const relPath = path.startsWith('/') ? path.slice(1) : path;
    const fullPath = join(sourceDir, relPath);
    try { rmSync(fullPath, { force: true }); } catch { /* ignore */ }
  }

  return {
    projectDir,
    sourceDir,
    writeSourceFiles,
    deleteSourceFile,

    makeProject(opts = {}) {
      return makeTestProject({ projectDir, ...opts });
    },

    mockScanResults(spec) {
      setSpecForDir(projectDir, spec);
    },

    async runPipeline(project) {
      const { source } = project.metadata.getScannerConfig();
      const pipeline = ScannerPipelineFactory.getScannerPipeline(source);
      if (!pipeline) {
        throw new Error(
          `No pipeline registered for source ${source}. ` +
          'Pass a valid Scanner.ScannerSource via ctx.makeProject({source: ...}).',
        );
      }
      return pipeline.run(project);
    },

    async destroy() {
      clearSpecForDir(projectDir);
      await (modelProvider.model as any)?.destroy?.();
      try { rmSync(projectDir, { recursive: true, force: true }); } catch { /* ignore */ }
    },
  };
}
