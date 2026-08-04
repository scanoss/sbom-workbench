/**
 * @jest-environment node
 *
 * End-to-end integration tests for the raw result import pipeline
 * (RawResultImportPipelineTask), driven against a result.json on disk.
 */

import {
  createTestContext, TestContext, Scanner,
  COMPONENTS, componentService, resultService,
} from './support/harness';
import { buildResultEntry } from './support/components';

let ctx: TestContext;

beforeEach(async () => { ctx = await createTestContext(); });
afterEach(async () => { await ctx.destroy(); });

const MATCHED = '/src/matched.c';
const REPLACED = '/src/replaced.c';

/**
 * A match whose purl was swapped by a `bom.replace` rule in the settings file.
 * When the replacement purl is not present anywhere else in the results, the
 * engine has no component data to copy over, so it blanks out every
 * component level field: version, latest, release_date and licenses.
 */
const replacedMatch = {
  ...buildResultEntry(REPLACED, {
    ...COMPONENTS.apiGo,
    file_hash: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  }),
  purl: ['pkg:github/scanoss/engine'],
  component: 'engine',
  vendor: 'scanoss',
  url: 'https://github.com/scanoss/engine',
  licenses: [],
  version: '',
  latest: '',
  release_date: '',
  status: 'identified',
};

describe('raw result import pipeline', () => {
  it('imports a component whose purl was replaced without a version', async () => {
    const importPath = ctx.writeImportedResults({
      [MATCHED]: [buildResultEntry(MATCHED, COMPONENTS.sbomWorkbench)],
      [REPLACED]: [replacedMatch],
    });

    const project = ctx.makeProject({
      source: Scanner.ScannerSource.IMPORTED_RESULTS_RAW,
      scanRoot: importPath,
    });
    await ctx.runPipeline(project);

    const components = await componentService.getAll({} as any);
    const replaced = components.find((c: any) => c.purl === 'pkg:github/scanoss/engine');
    expect(replaced).toBeDefined();
    expect(replaced.name).toBe('engine');
    expect(replaced.versions).toHaveLength(1);
    expect(replaced.versions[0].version).toBe('');
    expect(replaced.totalFiles).toBe(1);

    // The regularly matched component is still imported alongside it.
    expect(components.some((c: any) => c.purl === COMPONENTS.sbomWorkbench.purl)).toBe(true);
  });

  it('imports a component replaced by a purl without a namespace', async () => {
    // scanoss-py takes the vendor from the replacement purl namespace, so a
    // purl without one (npm, pypi, cargo...) comes back with a null vendor.
    const importPath = ctx.writeImportedResults({
      [REPLACED]: [{
        ...replacedMatch,
        purl: ['pkg:npm/express'],
        component: 'express',
        vendor: null,
        url: 'https://registry.npmjs.org/express',
      }],
    });

    const project = ctx.makeProject({
      source: Scanner.ScannerSource.IMPORTED_RESULTS_RAW,
      scanRoot: importPath,
    });
    await ctx.runPipeline(project);

    const components = await componentService.getAll({} as any);
    expect(components.map((c: any) => c.purl)).toContain('pkg:npm/express');
  });

  it('links the replaced component to its file results', async () => {
    const importPath = ctx.writeImportedResults({ [REPLACED]: [replacedMatch] });

    const project = ctx.makeProject({
      source: Scanner.ScannerSource.IMPORTED_RESULTS_RAW,
      scanRoot: importPath,
    });
    await ctx.runPipeline(project);

    const results = await resultService.getFromPath(REPLACED);
    expect(results).toHaveLength(1);
    expect(results[0].purl).toBe('pkg:github/scanoss/engine');
    expect(results[0].component).toMatchObject({
      purl: 'pkg:github/scanoss/engine',
      name: 'engine',
      version: '',
    });
  });
});
