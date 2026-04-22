/**
 * @jest-environment node
 *
 * End-to-end integration tests for the scan / re-scan pipeline.
 * Drives the real CodeScannerPipelineTask against a temp project; only
 * the SCANOSS engine itself is mocked (see ./support/mocks.ts).
 *
 */

import {
  createTestContext, TestContext, randomFileContent, md5,
  COMPONENTS, NO_MATCH, Scanner,
  fileService, inventoryService, resultService, componentService,
} from './support/harness';

let ctx: TestContext;

beforeEach(async () => { ctx = await createTestContext(); });
afterEach(async () => { await ctx.destroy(); });

const PATH = '/src/main/app.ts';

describe('scan pipeline', () => {
  it('populates files, results and component_versions', async () => {
    const content = randomFileContent();
    ctx.writeSourceFiles({ [PATH]: content });
    ctx.mockScanResults({ [PATH]: COMPONENTS.sbomWorkbench });

    const project = ctx.makeProject({ mode: Scanner.ScannerMode.SCAN });
    await ctx.runPipeline(project);

    const file = await fileService.get({ path: PATH });
    expect(file).toBeDefined();
    expect(file.md5_file).toBe(md5(content));
    expect(file.identified).toBe(0);

    const results = await resultService.getFromPath(PATH);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].component?.name).toBe('sbom-workbench');

    const components = await componentService.getAll({} as any);
    expect(components.some((c: any) => c.name === 'sbom-workbench')).toBe(true);
  });

  it('identification writes file_inventories and flips identified=1', async () => {
    ctx.writeSourceFiles({ [PATH]: randomFileContent() });
    ctx.mockScanResults({ [PATH]: COMPONENTS.sbomWorkbench });
    const project = ctx.makeProject({ mode: Scanner.ScannerMode.SCAN });
    await ctx.runPipeline(project);

    const file = await fileService.get({ path: PATH });
    await inventoryService.create({
      purl: COMPONENTS.sbomWorkbench.purl,
      version: COMPONENTS.sbomWorkbench.version,
      usage: 'file',
      notes: null,
      url: null,
      spdxid: 'MIT',
      files: [file.fileId],
    } as any);

    const after = await fileService.get({ path: PATH });
    expect(after.identified).toBe(1);
    expect(await inventoryService.getAllByFile(PATH)).toHaveLength(1);
  });
});

describe('rescan pipeline', () => {
  // ─── A — same content + same match → preserved ──────────────────────────
  it('A — same content → identification preserved', async () => {
    const content = randomFileContent();
    ctx.writeSourceFiles({ [PATH]: content });
    ctx.mockScanResults({ [PATH]: COMPONENTS.sbomWorkbench });
    const project = ctx.makeProject({ mode: Scanner.ScannerMode.SCAN });
    await ctx.runPipeline(project);

    const file = await fileService.get({ path: PATH });
    await inventoryService.create({
      purl: COMPONENTS.sbomWorkbench.purl,
      version: COMPONENTS.sbomWorkbench.version,
      usage: 'file',
      notes: null,
      url: null,
      spdxid: 'MIT',
      files: [file.fileId],
    } as any);
    const before = await fileService.get({ path: PATH });

    // Do not rewrite the source file — same content on disk → same md5.
    project.metadata.getScannerConfig().mode = Scanner.ScannerMode.RESCAN;
    ctx.mockScanResults({ [PATH]: COMPONENTS.sbomWorkbench });
    await ctx.runPipeline(project);

    const after = await fileService.get({ path: PATH });
    expect(after.fileId).toBe(before.fileId);
    expect(after.md5_file).toBe(md5(content));
    expect(after.md5_file).toBe(before.md5_file);
    expect(after.identified).toBe(1);
    expect(await inventoryService.getAllByFile(PATH)).toHaveLength(1);
  });

  // ─── B — same content + new match added → preserved ─────────────────────
  it('B — same content + KB now reports an additional match → identification preserved', async () => {
    ctx.writeSourceFiles({ [PATH]: randomFileContent() });
    ctx.mockScanResults({ [PATH]: COMPONENTS.sbomWorkbench });
    const project = ctx.makeProject({ mode: Scanner.ScannerMode.SCAN });
    await ctx.runPipeline(project);

    const file = await fileService.get({ path: PATH });
    await inventoryService.create({
      purl: COMPONENTS.sbomWorkbench.purl,
      version: COMPONENTS.sbomWorkbench.version,
      usage: 'file',
      notes: null,
      url: null,
      spdxid: 'MIT',
      files: [file.fileId],
    } as any);
    const before = await fileService.get({ path: PATH });

    // Same file on disk, so md5 unchanged. Engine now reports two matches.
    project.metadata.getScannerConfig().mode = Scanner.ScannerMode.RESCAN;
    ctx.mockScanResults({
      [PATH]: [COMPONENTS.sbomWorkbench, COMPONENTS.apiGo],
    });
    await ctx.runPipeline(project);

    const after = await fileService.get({ path: PATH });
    expect(after.fileId).toBe(before.fileId);
    expect(after.md5_file).toBe(before.md5_file);
    expect(after.identified).toBe(1);
    expect(await inventoryService.getAllByFile(PATH)).toHaveLength(1);

    // Both matches should now be visible in the detected panel.
    const results = await resultService.getFromPath(PATH);
    const componentNames = results.map((r: any) => r.component?.name);
    expect(componentNames).toContain('sbom-workbench');
    expect(componentNames).toContain('api.go');
  });

  // ─── C — content changed → invalidated ──────────────────────────────────
  it('C — content changed → identification invalidated, file back to PENDING', async () => {
    ctx.writeSourceFiles({ [PATH]: randomFileContent() });
    ctx.mockScanResults({ [PATH]: COMPONENTS.sbomWorkbench });
    const project = ctx.makeProject({ mode: Scanner.ScannerMode.SCAN });
    await ctx.runPipeline(project);

    const file = await fileService.get({ path: PATH });
    await inventoryService.create({
      purl: COMPONENTS.sbomWorkbench.purl,
      version: COMPONENTS.sbomWorkbench.version,
      usage: 'file',
      notes: null,
      url: null,
      spdxid: 'MIT',
      files: [file.fileId],
    } as any);

    // Rewrite the source file with different content → different md5.
    const newContent = randomFileContent();
    ctx.writeSourceFiles({ [PATH]: newContent });

    project.metadata.getScannerConfig().mode = Scanner.ScannerMode.RESCAN;
    ctx.mockScanResults({ [PATH]: COMPONENTS.apiGo });
    await ctx.runPipeline(project);

    const after = await fileService.get({ path: PATH });
    const inventory = await inventoryService.getAllByFile(PATH);
    const results = await resultService.getFromPath(PATH);

    expect(after.md5_file).toBe(md5(newContent));
    expect(after.identified).toBe(0);
    expect(after.ignored).toBe(0);
    expect(inventory).toHaveLength(0);

    expect(results.some((r: any) => r.component?.name === 'api.go')).toBe(true);
  });

  // ─── D — content changed to NO-MATCH → identification invalidated ───────
  // (local md5 during tree build) we now DO catch this case:
  // the file on disk has a new md5 even if the engine returns 'none'.
  it('D — content changed to NO-MATCH → identification invalidated', async () => {
    ctx.writeSourceFiles({ [PATH]: randomFileContent() });
    ctx.mockScanResults({ [PATH]: COMPONENTS.sbomWorkbench });
    const project = ctx.makeProject({ mode: Scanner.ScannerMode.SCAN });
    await ctx.runPipeline(project);

    const file = await fileService.get({ path: PATH });
    await inventoryService.create({
      purl: COMPONENTS.sbomWorkbench.purl,
      version: COMPONENTS.sbomWorkbench.version,
      usage: 'file',
      notes: null,
      url: null,
      spdxid: 'MIT',
      files: [file.fileId],
    } as any);

    // Content changes on disk, engine says no match.
    const newContent = randomFileContent();
    ctx.writeSourceFiles({ [PATH]: newContent });

    project.metadata.getScannerConfig().mode = Scanner.ScannerMode.RESCAN;
    ctx.mockScanResults({ [PATH]: NO_MATCH });
    await ctx.runPipeline(project);

    const after = await fileService.get({ path: PATH });
    expect(after.md5_file).toBe(md5(newContent));
    expect(after.identified).toBe(0);
    expect(await inventoryService.getAllByFile(PATH)).toHaveLength(0);
    expect(await resultService.getFromPath(PATH)).toHaveLength(0);
  });

  // ─── E — NO-MATCH file whose content changes updates md5 ────────────────
  it('E — NO-MATCH content change → md5 updated', async () => {
    const content1 = randomFileContent();
    ctx.writeSourceFiles({ [PATH]: content1 });
    ctx.mockScanResults({ [PATH]: NO_MATCH });
    const project = ctx.makeProject({ mode: Scanner.ScannerMode.SCAN });
    await ctx.runPipeline(project);

    const initial = await fileService.get({ path: PATH });
    expect(initial.md5_file).toBe(md5(content1));

    const content2 = randomFileContent();
    ctx.writeSourceFiles({ [PATH]: content2 });
    project.metadata.getScannerConfig().mode = Scanner.ScannerMode.RESCAN;
    ctx.mockScanResults({ [PATH]: NO_MATCH });
    await ctx.runPipeline(project);

    const after = await fileService.get({ path: PATH });
    expect(after.md5_file).toBe(md5(content2));
  });

  // ─── F — file deleted from disk → cascade cleans FK rows ────────────────
  it('F — file deleted from disk → row removed, cascade cleans FKs', async () => {
    ctx.writeSourceFiles({ [PATH]: randomFileContent() });
    ctx.mockScanResults({ [PATH]: COMPONENTS.sbomWorkbench });
    const project = ctx.makeProject({ mode: Scanner.ScannerMode.SCAN });
    await ctx.runPipeline(project);

    const file = await fileService.get({ path: PATH });
    await inventoryService.create({
      purl: COMPONENTS.sbomWorkbench.purl,
      version: COMPONENTS.sbomWorkbench.version,
      usage: 'file',
      notes: null,
      url: null,
      spdxid: 'MIT',
      files: [file.fileId],
    } as any);
    expect(await inventoryService.getAllByFile(PATH)).toHaveLength(1);

    // User deletes the file from disk between scans.
    ctx.deleteSourceFile(PATH);

    project.metadata.getScannerConfig().mode = Scanner.ScannerMode.RESCAN;
    ctx.mockScanResults({}); // engine reports nothing for the gone file
    await ctx.runPipeline(project);

    expect(await fileService.get({ path: PATH })).toBeUndefined();
    expect(await inventoryService.getAllByFile(PATH)).toHaveLength(0);
    expect(await resultService.getFromPath(PATH)).toHaveLength(0);
  });

  // ─── G — new file appears on disk → fresh row inserted ──────────────────
  it('G — new file appears on disk → row created with md5 populated, PENDING', async () => {
    const NEW_PATH = '/src/main/added.ts';

    ctx.writeSourceFiles({ [PATH]: randomFileContent() });
    ctx.mockScanResults({ [PATH]: COMPONENTS.sbomWorkbench });
    const project = ctx.makeProject({ mode: Scanner.ScannerMode.SCAN });
    await ctx.runPipeline(project);
    const file = await fileService.get({ path: PATH });
    await inventoryService.create({
      purl: COMPONENTS.sbomWorkbench.purl,
      version: COMPONENTS.sbomWorkbench.version,
      usage: 'file',
      notes: null,
      url: null,
      spdxid: 'MIT',
      files: [file.fileId],
    } as any);

    // User adds a new file before rescan.
    const newContent = randomFileContent();
    ctx.writeSourceFiles({ [NEW_PATH]: newContent });

    project.metadata.getScannerConfig().mode = Scanner.ScannerMode.RESCAN;
    ctx.mockScanResults({
      [PATH]: COMPONENTS.sbomWorkbench,
      [NEW_PATH]: COMPONENTS.apiGo,
    });
    await ctx.runPipeline(project);

    const newFile = await fileService.get({ path: NEW_PATH });
    expect(newFile).toBeDefined();
    expect(newFile.md5_file).toBe(md5(newContent));
    expect(newFile.identified).toBe(0);
    expect(await inventoryService.getAllByFile(NEW_PATH)).toHaveLength(0);

    // Original file's identification untouched.
    const original = await fileService.get({ path: PATH });
    expect(original.identified).toBe(1);
    expect(await inventoryService.getAllByFile(PATH)).toHaveLength(1);
  });

  // ─── H — file renamed (same content, different path) ────────────────────
  // The rescan pipeline treats rename as delete-at-old + add-at-new: the old
  // path is dropped via dirty-sweep (cascade wipes its file_inventories) and
  // the new path gets a fresh files row. The identification does NOT transfer,
  // even though md5 is identical. Documenting current behavior.
  it('H — file renamed (same content) → old path invalidated, new path fresh', async () => {
    const OLD_PATH = '/src/main/old.ts';
    const NEW_PATH = '/src/main/new.ts';
    const content = randomFileContent();

    ctx.writeSourceFiles({ [OLD_PATH]: content });
    ctx.mockScanResults({ [OLD_PATH]: COMPONENTS.sbomWorkbench });
    const project = ctx.makeProject({ mode: Scanner.ScannerMode.SCAN });
    await ctx.runPipeline(project);

    const file = await fileService.get({ path: OLD_PATH });
    await inventoryService.create({
      purl: COMPONENTS.sbomWorkbench.purl,
      version: COMPONENTS.sbomWorkbench.version,
      usage: 'file',
      notes: null,
      url: null,
      spdxid: 'MIT',
      files: [file.fileId],
    } as any);
    expect(await inventoryService.getAllByFile(OLD_PATH)).toHaveLength(1);

    // Simulate rename: same bytes at a different path.
    ctx.deleteSourceFile(OLD_PATH);
    ctx.writeSourceFiles({ [NEW_PATH]: content });

    project.metadata.getScannerConfig().mode = Scanner.ScannerMode.RESCAN;
    ctx.mockScanResults({ [NEW_PATH]: COMPONENTS.sbomWorkbench });
    await ctx.runPipeline(project);

    // Old path vanished: row + inventory link cleaned by cascade.
    expect(await fileService.get({ path: OLD_PATH })).toBeUndefined();
    expect(await inventoryService.getAllByFile(OLD_PATH)).toHaveLength(0);

    // New path has a fresh row with the same md5 but no identification.
    const renamed = await fileService.get({ path: NEW_PATH });
    expect(renamed).toBeDefined();
    expect(renamed.md5_file).toBe(md5(content));
    expect(renamed.identified).toBe(0);
    expect(await inventoryService.getAllByFile(NEW_PATH)).toHaveLength(0);
  });
});
