import { ScanState } from '../../../../api/types';

jest.mock('../scan/CodeScanTask', () => {
  class MockCodeScanTask {
    project: any;

    constructor(project: any) {
      this.project = project;
    }
  }
  return { CodeScanTask: MockCodeScanTask };
});

jest.mock('../scan/ScanTask', () => {
  class MockScanTask {
    project: any;

    constructor(project: any) {
      this.project = project;
    }
  }
  return { ScanTask: MockScanTask };
});

import { ResumeScanTask } from './ResumeScanTask';
import { WFPResumeTask } from './WFPResumeTask';

describe('Resume tasks with compact filesSummary shape', () => {
  const createProjectMock = () => ({
    open: jest.fn().mockResolvedValue(true),
    processedFiles: 0,
    filesSummary: { total: 10, include: 10, filter: 0 },
    filesToScan: {
      '/repo/a.ts': 'FULL_SCAN',
      '/repo/b.ts': 'FULL_SCAN',
      '/repo/c.ts': 'MD5_SCAN',
    },
    metadata: {
      getScannerState: jest.fn(() => ScanState.SCANNING),
    },
  });

  it('ResumeScanTask computes processed files without filesSummary.files', async () => {
    const project: any = createProjectMock();
    const task = new ResumeScanTask(project);

    await task.set();

    expect(project.processedFiles).toBe(7);
  });

  it('WFPResumeTask computes processed files without filesSummary.files', async () => {
    const project: any = createProjectMock();
    const task = new WFPResumeTask(project);

    await task.set();

    expect(project.processedFiles).toBe(7);
  });
});
