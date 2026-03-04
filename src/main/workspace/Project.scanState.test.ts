import { normalizeProjectScanState } from './projectScanState';

describe('Project scan state normalization', () => {
  it('keeps counters and drops legacy filesSummary.files payload', () => {
    const filesToScan = {
      '/repo/a.ts': 'FULL_SCAN',
      '/repo/b.ts': 'MD5_SCAN',
    };
    const oldSummary = {
      total: 10,
      include: 8,
      filter: 2,
      files: filesToScan,
    };

    const normalized = normalizeProjectScanState(
      filesToScan,
      {},
      3,
      oldSummary,
    );

    expect(normalized.filesToScan).toEqual(filesToScan);
    expect(normalized.filesSummary).toEqual({
      total: 10,
      include: 8,
      filter: 2,
    });
    expect((normalized.filesSummary as any).files).toBeUndefined();
  });

  it('derives safe defaults when filesSummary is missing or malformed', () => {
    const filesToScan = {
      '/repo/a.ts': 'FULL_SCAN',
      '/repo/b.ts': 'FULL_SCAN',
      '/repo/c.ts': 'MD5_SCAN',
    };

    const normalized = normalizeProjectScanState(
      filesToScan,
      null,
      'invalid',
      {
        total: 'invalid',
        include: null,
      },
    );

    expect(normalized.filesToScan).toEqual(filesToScan);
    expect(normalized.filesNotScanned).toEqual({});
    expect(normalized.processedFiles).toBe(0);
    expect(normalized.filesSummary).toEqual({
      total: 3,
      include: 3,
      filter: 0,
    });
  });

  it('normalizes include to be at least filesToScan count', () => {
    const filesToScan = {
      '/repo/a.ts': 'FULL_SCAN',
      '/repo/b.ts': 'FULL_SCAN',
      '/repo/c.ts': 'FULL_SCAN',
      '/repo/d.ts': 'FULL_SCAN',
    };

    const normalized = normalizeProjectScanState(
      filesToScan,
      {},
      0,
      {
        total: 2,
        include: 1,
        filter: 1,
      },
    );

    expect(normalized.filesSummary).toEqual({
      total: 4,
      include: 4,
      filter: 1,
    });
  });
});
