/**
 * @jest-environment node
 *
 * Integration tests for the SP-4377 fix: rescan must survive transient
 * EPERM/EBUSY/EACCES on fs.rename/unlink (e.g. on Windows SMB shares),
 * and must surface persistent failures as catchable errors instead of
 * uncaught exceptions that crash the main process.
 */

import fs from 'fs';
import {
  createTestContext, TestContext, randomFileContent,
  COMPONENTS, Scanner,
} from './support/harness';

let ctx: TestContext;

beforeEach(async () => { ctx = await createTestContext(); });
afterEach(async () => {
  jest.restoreAllMocks();
  await ctx.destroy();
});

const PATH = '/src/main/app.ts';

function fsError(code: string): NodeJS.ErrnoException {
  const err = new Error(`mock ${code}`) as NodeJS.ErrnoException;
  err.code = code;
  return err;
}

/**
 * Spy on fs.promises.rename and inject `failures` consecutive errors with
 * `code` when the destination ends with `targetSuffix`. Other renames pass
 * through to the real implementation.
 */
function injectRenameFailures(
  targetSuffix: string,
  code: string,
  failures: number,
) {
  const realRename = fs.promises.rename.bind(fs.promises);
  let injected = 0;
  return jest.spyOn(fs.promises, 'rename').mockImplementation(async (src, dst) => {
    if (dst.toString().endsWith(targetSuffix) && injected < failures) {
      injected++;
      throw fsError(code);
    }
    return realRename(src, dst);
  });
}

/**
 * Spy on fs.promises.unlink and inject errors with `code` when the target
 * ends with `targetSuffix`. If `failures` is Infinity, fails every time.
 */
function injectUnlinkFailures(
  targetSuffix: string,
  code: string,
  failures: number,
) {
  const realUnlink = fs.promises.unlink.bind(fs.promises);
  let injected = 0;
  return jest.spyOn(fs.promises, 'unlink').mockImplementation(async (path) => {
    if (path.toString().endsWith(targetSuffix) && injected < failures) {
      injected++;
      throw fsError(code);
    }
    return realUnlink(path);
  });
}

describe('scan pipeline — transient fs errors', () => {
  it('survives 2 transient EBUSY on rename → scan completes', async () => {
    ctx.writeSourceFiles({ [PATH]: randomFileContent() });
    ctx.mockScanResults({ [PATH]: COMPONENTS.sbomWorkbench });

    // Inject 2 EBUSY failures on the rename of result.json during done().
    // retryWithBackoff should absorb them and the scan should succeed.
    const spy = injectRenameFailures('result.json', 'EBUSY', 2);

    const project = ctx.makeProject({ mode: Scanner.ScannerMode.SCAN });
    const result = await ctx.runPipeline(project);

    expect(result).toBe(true);
    expect(spy.mock.calls.length).toBeGreaterThanOrEqual(3);
  });
});

describe('scan pipeline — persistent fs errors are caught, never uncaught', () => {
  it('persistent EPERM on rename → pipeline throws (not uncaught crash)', async () => {
    ctx.writeSourceFiles({ [PATH]: randomFileContent() });
    ctx.mockScanResults({ [PATH]: COMPONENTS.sbomWorkbench });

    injectRenameFailures('result.json', 'EPERM', Infinity);

    const project = ctx.makeProject({ mode: Scanner.ScannerMode.SCAN });

    await expect(ctx.runPipeline(project)).rejects.toMatchObject({ code: 'EPERM' });
  });
});

describe('rescan pipeline — transient fs errors', () => {
  it('survives 2 transient EBUSY on rename → rescan completes', async () => {
    ctx.writeSourceFiles({ [PATH]: randomFileContent() });
    ctx.mockScanResults({ [PATH]: COMPONENTS.sbomWorkbench });
    const project = ctx.makeProject({ mode: Scanner.ScannerMode.SCAN });
    await ctx.runPipeline(project);

    // Now inject 2 EBUSY failures on the next rename of result.json — the
    // retryWithBackoff should absorb them and the rescan should succeed.
    const spy = injectRenameFailures('result.json', 'EBUSY', 2);

    project.metadata.getScannerConfig().mode = Scanner.ScannerMode.RESCAN;
    ctx.mockScanResults({ [PATH]: COMPONENTS.sbomWorkbench });
    const result = await ctx.runPipeline(project);

    expect(result).toBe(true);
    // 2 injected failures + 1 successful real rename
    expect(spy.mock.calls.length).toBeGreaterThanOrEqual(3);
  });

  it('survives 2 transient EACCES on unlink (init) → rescan completes', async () => {
    ctx.writeSourceFiles({ [PATH]: randomFileContent() });
    ctx.mockScanResults({ [PATH]: COMPONENTS.sbomWorkbench });
    const project = ctx.makeProject({ mode: Scanner.ScannerMode.SCAN });
    await ctx.runPipeline(project);

    // RescanTask.init() calls unlink on result.json before re-scanning.
    // Two transient EACCES should be absorbed by retryWithBackoff.
    const spy = injectUnlinkFailures('result.json', 'EACCES', 2);

    project.metadata.getScannerConfig().mode = Scanner.ScannerMode.RESCAN;
    ctx.mockScanResults({ [PATH]: COMPONENTS.sbomWorkbench });
    const result = await ctx.runPipeline(project);

    expect(result).toBe(true);
    expect(spy.mock.calls.length).toBeGreaterThanOrEqual(3);
  });
});

describe('rescan pipeline — persistent fs errors are caught, never uncaught', () => {
  it('persistent EPERM on rename → pipeline throws (not uncaught crash)', async () => {
    ctx.writeSourceFiles({ [PATH]: randomFileContent() });
    ctx.mockScanResults({ [PATH]: COMPONENTS.sbomWorkbench });
    const project = ctx.makeProject({ mode: Scanner.ScannerMode.SCAN });
    await ctx.runPipeline(project);

    // Persistent EPERM on rename. retryWithBackoff exhausts after 6
    // attempts and throws — our try/catch surfaces it, ScannerPipeline
    // logs it and rejects the run promise (no JS-error crash dialog).
    injectRenameFailures('result.json', 'EPERM', Infinity);

    project.metadata.getScannerConfig().mode = Scanner.ScannerMode.RESCAN;
    ctx.mockScanResults({ [PATH]: COMPONENTS.sbomWorkbench });

    await expect(ctx.runPipeline(project)).rejects.toMatchObject({ code: 'EPERM' });
  });

  it('persistent EBUSY on unlink (init) → pipeline throws (not uncaught crash)', async () => {
    ctx.writeSourceFiles({ [PATH]: randomFileContent() });
    ctx.mockScanResults({ [PATH]: COMPONENTS.sbomWorkbench });
    const project = ctx.makeProject({ mode: Scanner.ScannerMode.SCAN });
    await ctx.runPipeline(project);

    injectUnlinkFailures('result.json', 'EBUSY', Infinity);

    project.metadata.getScannerConfig().mode = Scanner.ScannerMode.RESCAN;
    ctx.mockScanResults({ [PATH]: COMPONENTS.sbomWorkbench });

    await expect(ctx.runPipeline(project)).rejects.toMatchObject({ code: 'EBUSY' });
  });
});
