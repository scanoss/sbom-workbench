export interface IProjectFilesSummary {
  total: number;
  include: number;
  filter: number;
}

export interface IProjectNormalizedScanState {
  filesToScan: Record<string, string | null>;
  filesNotScanned: Record<string, unknown>;
  processedFiles: number;
  filesSummary: IProjectFilesSummary;
}

export const normalizeProjectScanState = (
  filesToScan: unknown,
  filesNotScanned: unknown,
  processedFiles: unknown,
  filesSummary: unknown,
): IProjectNormalizedScanState => {
  const safeFilesToScan = filesToScan && typeof filesToScan === 'object' ? filesToScan as Record<string, string | null> : {};
  const safeFilesNotScanned = filesNotScanned && typeof filesNotScanned === 'object' ? filesNotScanned as Record<string, unknown> : {};
  const safeProcessedFiles = Number.isFinite(processedFiles) ? Number(processedFiles) : 0;
  const filesToScanCount = Object.keys(safeFilesToScan).length;

  const rawSummary = filesSummary && typeof filesSummary === 'object' ? filesSummary as Record<string, unknown> : {};
  const rawInclude = Number(rawSummary.include);
  const include = Number.isFinite(rawInclude) ? Math.max(rawInclude, filesToScanCount) : filesToScanCount;

  const rawTotal = Number(rawSummary.total);
  const total = Number.isFinite(rawTotal) ? Math.max(rawTotal, include) : include;

  const rawFilter = Number(rawSummary.filter);
  const filter = Number.isFinite(rawFilter) ? Math.max(0, rawFilter) : Math.max(0, total - include);

  return {
    filesToScan: safeFilesToScan,
    filesNotScanned: safeFilesNotScanned,
    processedFiles: safeProcessedFiles,
    filesSummary: {
      total,
      include,
      filter,
    },
  };
};

export const createFilesSummary = (total: number, include: number, filter: number): IProjectFilesSummary => ({
  total,
  include,
  filter,
});
