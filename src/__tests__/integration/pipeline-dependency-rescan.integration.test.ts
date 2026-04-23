/**
 * @jest-environment node
 */

import {
  createTestContext, TestContext,
  randomFileContent,
  DEPENDENCIES, Scanner,
  dependencyService,
} from './support/harness';

let ctx: TestContext;

beforeEach(async () => { ctx = await createTestContext(); });
afterEach(async () => { await ctx.destroy(); });

const MANIFEST = '/package.json';

describe('dependency rescan preserves user decisions', () => {
  it('keeps a rejected dependency rejected after rescan when the manifest has not changed', async () => {
    ctx.writeSourceFiles({ [MANIFEST]: randomFileContent() });
    ctx.mockDependencyScan({ [MANIFEST]: [DEPENDENCIES.lodash, DEPENDENCIES.react] });

    const project = ctx.makeProject({
      mode: Scanner.ScannerMode.SCAN,
      pipelineStages: [Scanner.PipelineStage.DEPENDENCIES],
      allExtensions: false,
    });
    await ctx.runPipeline(project);

    const afterScan = await dependencyService.getAll({});
    expect(afterScan).toHaveLength(2);
    const lodash = afterScan.find((d) => d.purl === DEPENDENCIES.lodash.purl);
    expect(lodash!.rejectedAt ?? null).toBeNull();

    await dependencyService.reject(lodash!.dependencyId);

    project.metadata.getScannerConfig().mode = Scanner.ScannerMode.RESCAN;
    await ctx.runPipeline(project);

    const afterRescan = await dependencyService.getAll({});
    const lodashAfter = afterRescan.find((d) => d.purl === DEPENDENCIES.lodash.purl);
    const reactAfter  = afterRescan.find((d) => d.purl === DEPENDENCIES.react.purl);

    expect(lodashAfter!.rejectedAt).not.toBeNull();
    expect(reactAfter!.rejectedAt ?? null).toBeNull();
  });

  it('does not carry a stale rejection when the manifest bumped the declared version', async () => {
    ctx.writeSourceFiles({ [MANIFEST]: randomFileContent() });
    ctx.mockDependencyScan({ [MANIFEST]: [DEPENDENCIES.lodash] });

    const project = ctx.makeProject({
      mode: Scanner.ScannerMode.SCAN,
      pipelineStages: [Scanner.PipelineStage.DEPENDENCIES],
      allExtensions: false,
    });
    await ctx.runPipeline(project);

    const [lodash] = await dependencyService.getAll({});
    await dependencyService.reject(lodash.dependencyId);

    const bumped = { ...DEPENDENCIES.lodash, version: '4.18.0', requirement: '^4.18.0' };
    ctx.mockDependencyScan({ [MANIFEST]: [bumped] });

    project.metadata.getScannerConfig().mode = Scanner.ScannerMode.RESCAN;
    await ctx.runPipeline(project);

    const [lodashAfter] = await dependencyService.getAll({});
    expect(lodashAfter.version).toBe('4.18.0');
    expect(lodashAfter.rejectedAt ?? null).toBeNull();
  });
});
