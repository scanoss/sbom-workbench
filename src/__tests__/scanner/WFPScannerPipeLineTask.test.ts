import { WFPScannerPipeLineTask } from '../../main/task/scanner/scannerPipeline/WFPScannerPipeLineTask';
import { Scanner } from '../../main/task/scanner/types';
import { Project } from '../../main/workspace/Project';

jest.mock('electron', () => ({
  app: {
    getPath: jest.fn(() => '/mock/path'),
    getName: jest.fn(() => 'MockAppName'),
    getVersion: jest.fn(() => '1.0.0'),
  },
  ipcMain: {
    on: jest.fn(),
    send: jest.fn(),
  },
}));

jest.mock('electron-log', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));

jest.mock('../../main/broadcastManager/BroadcastManager', () => ({
  broadcastManager: {
    get: () => ({
      send: jest.fn(),
    }),
  },
}));

// Mock the task constructors to return objects with required methods
const mockTaskInstance = {
  getStageProperties: jest.fn(() => ({
    name: 'mock-stage',
    label: 'Mock Stage',
    isCritical: false,
  })),
  run: jest.fn(() => Promise.resolve(true)),
};

const mockDependencyTaskInstance = {
  ...mockTaskInstance,
  getStageProperties: jest.fn(() => ({
    name: 'dependency',
    label: 'Analyzing Dependencies',
    isCritical: false,
  })),
  run: jest.fn(() => Promise.resolve(true)),
};

jest.mock('../../main/task/scanner/scan/WFPScanTask', () => ({
  WFPScanTask: jest.fn(() => mockTaskInstance),
}));

jest.mock('../../main/task/scanner/rescan/WFPRescanTask', () => ({
  WFPRescanTask: jest.fn(() => mockTaskInstance),
}));

jest.mock('../../main/task/scanner/resume/WFPResumeTask', () => ({
  WFPResumeTask: jest.fn(() => mockTaskInstance),
}));

jest.mock('../../main/task/scanner/dependency/DependencyTask', () => ({
  DependencyTask: jest.fn(() => mockDependencyTaskInstance),
}));

jest.mock('../../main/task/scanner/dependency/ReScanDependencyTask', () => ({
  ReScanDependencyTask: jest.fn(() => mockDependencyTaskInstance),
}));

jest.mock('../../main/task/scanner/vulnerability/VulnerabilitiesTask', () => ({
  VulnerabilitiesTask: jest.fn(() => mockTaskInstance),
}));

jest.mock('../../main/task/scanner/cryptography/CryptographyTask', () => ({
  CryptographyTask: jest.fn(() => mockTaskInstance),
}));

jest.mock('../../main/task/IndexTreeTask/WFPIndexTreeTask', () => ({
  WFPIndexTreeTask: jest.fn(() => mockTaskInstance),
}));

jest.mock('../../main/task/search/indexTask/IndexTask', () => ({
  IndexTask: jest.fn(() => mockTaskInstance),
}));

import { DependencyTask } from '../../main/task/scanner/dependency/DependencyTask';
import { ReScanDependencyTask } from '../../main/task/scanner/dependency/ReScanDependencyTask';

describe('WFPScannerPipeLineTask', () => {
  let pipeline: WFPScannerPipeLineTask;

  const createMockProject = (
    mode: Scanner.ScannerMode,
    pipelineStages: Scanner.PipelineStage[],
    apiKey?: string,
  ): Project => {
    return {
      metadata: {
        getScannerConfig: () => ({
          mode,
          pipelineStages,
        }),
        setScannerState: jest.fn(),
        getWorkRoot: jest.fn(() => '/mock/work/root'),
      },
      getApiKey: jest.fn(() => apiKey || ''),
      save: jest.fn(),
      close: jest.fn(() => Promise.resolve()),
    } as unknown as Project;
  };

  beforeEach(() => {
    pipeline = new WFPScannerPipeLineTask();
    jest.clearAllMocks();
  });

  it('includes DependencyTask when DEPENDENCIES stage is enabled in SCAN mode', async () => {
    const project = createMockProject(
      Scanner.ScannerMode.SCAN,
      [Scanner.PipelineStage.DEPENDENCIES],
    );

    await pipeline.run(project);

    expect(DependencyTask).toHaveBeenCalledWith(project);
    expect(ReScanDependencyTask).not.toHaveBeenCalled();
  });

  it('includes ReScanDependencyTask when DEPENDENCIES stage is enabled in RESCAN mode', async () => {
    const project = createMockProject(
      Scanner.ScannerMode.RESCAN,
      [Scanner.PipelineStage.DEPENDENCIES],
    );

    await pipeline.run(project);

    expect(ReScanDependencyTask).toHaveBeenCalledWith(project);
  });

  it('does not include DependencyTask when DEPENDENCIES stage is not enabled', async () => {
    const project = createMockProject(
      Scanner.ScannerMode.SCAN,
      [],
    );

    await pipeline.run(project);

    expect(DependencyTask).not.toHaveBeenCalled();
    expect(ReScanDependencyTask).not.toHaveBeenCalled();
  });

  it('includes DependencyTask when DEPENDENCIES is among multiple stages', async () => {
    const project = createMockProject(
      Scanner.ScannerMode.SCAN,
      [
        Scanner.PipelineStage.DEPENDENCIES,
        Scanner.PipelineStage.VULNERABILITIES,
      ],
    );

    await pipeline.run(project);

    expect(DependencyTask).toHaveBeenCalledWith(project);
  });
});
