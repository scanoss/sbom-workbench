jest.mock('../../services/FileService', () => ({
  fileService: {
    insert: jest.fn(),
  },
}));

import { CodeIndexTreeTask } from './CodeIndexTreeTask';
import { WFPIndexTreeTask } from './WFPIndexTreeTask';
import { RawResultFileTreeTask } from '../rawImportResult/RawResultFileTreeTask';

describe('Index tree summary shape', () => {
  const createProjectMock = () => ({
    filesToScan: {},
    filesSummary: null,
    filesNotScanned: null,
    processedFiles: -1,
    metadata: {
      setFileCounter: jest.fn(),
    },
    setTree: jest.fn(),
    saveWithSnapshot: jest.fn(),
  });

  it('CodeIndexTreeTask stores filesToScan map and summary counters only', () => {
    const project: any = createProjectMock();
    const task = new CodeIndexTreeTask(project);
    const summary = {
      total: 12,
      include: 10,
      filter: 2,
      files: {
        '/repo/a.ts': 'FULL_SCAN',
        '/repo/b.ts': 'MD5_SCAN',
      },
    };

    const tree: any = {
      summarize: jest.fn(),
      getSummarize: jest.fn(() => summary),
    };

    task.setTreeSummary(tree);

    expect(project.filesToScan).toEqual(summary.files);
    expect(project.filesSummary).toEqual({
      total: 12,
      include: 10,
      filter: 2,
    });
    expect(project.filesSummary.files).toBeUndefined();
    expect(project.saveWithSnapshot).toHaveBeenCalled();
  });

  it('WFPIndexTreeTask stores summary counters only', () => {
    const project: any = createProjectMock();
    const task = new WFPIndexTreeTask(project);
    (task as any).filesToScan = ['/repo/a.ts', '/repo/b.ts'];
    const tree: any = {};

    task.setTreeSummary(tree);

    expect(project.filesToScan).toEqual({
      '/repo/a.ts': null,
      '/repo/b.ts': null,
    });
    expect(project.filesSummary).toEqual({
      total: 2,
      include: 2,
      filter: 0,
    });
    expect(project.filesSummary.files).toBeUndefined();
    expect(project.saveWithSnapshot).toHaveBeenCalled();
  });

  it('RawResultFileTreeTask stores summary counters only', () => {
    const project: any = createProjectMock();
    const task = new RawResultFileTreeTask(project);
    (task as any).filesToScan = ['/repo/a.ts', '/repo/b.ts', '/repo/c.ts'];
    const tree: any = {};

    task.setTreeSummary(tree);

    expect(project.filesToScan).toEqual({
      '/repo/a.ts': null,
      '/repo/b.ts': null,
      '/repo/c.ts': null,
    });
    expect(project.filesSummary).toEqual({
      total: 3,
      include: 3,
      filter: 0,
    });
    expect(project.filesSummary.files).toBeUndefined();
    expect(project.saveWithSnapshot).toHaveBeenCalled();
  });
});
