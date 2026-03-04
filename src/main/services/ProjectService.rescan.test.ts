import { ProjectState } from '../../api/types';
import { Scanner } from '../task/scanner/types';

jest.mock('../workspace/Workspace', () => ({
  workspace: {
    openProject: jest.fn(),
    closeAllProjects: jest.fn(),
    getProject: jest.fn(),
  },
}));

jest.mock('../task/scanner/scannerPipelineFactory/ScannerPipelineFactory', () => ({
  ScannerPipelineFactory: {
    getScannerPipeline: jest.fn(),
  },
}));

jest.mock('./UserSettingService', () => ({
  userSettingService: {
    get: jest.fn(() => ({
      DEFAULT_API_INDEX: 0,
      APIS: [{ API_KEY: '' }],
      WORKSPACES: [{ SCAN_SOURCES: '/tmp', PATH: '/tmp' }],
    })),
  },
}));

import { workspace } from '../workspace/Workspace';
import { ScannerPipelineFactory } from '../task/scanner/scannerPipelineFactory/ScannerPipelineFactory';
import { projectService } from './ProjectService';

describe('ProjectService reScan lifecycle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createProjectMock = (initialState: ProjectState = ProjectState.OPENED) => {
    const scannerConfig = {
      mode: Scanner.ScannerMode.SCAN,
      source: Scanner.ScannerSource.CODE,
    };
    let state = initialState;

    return {
      metadata: {
        getScannerConfig: jest.fn(() => scannerConfig),
        save: jest.fn(),
      },
      getState: jest.fn(() => state),
      open: jest.fn(async () => {
        state = ProjectState.OPENED;
      }),
      save: jest.fn(),
      close: jest.fn(async () => {
        state = ProjectState.CLOSED;
      }),
    };
  };

  it('opens the project before running rescan pipeline', async () => {
    const projectMock = createProjectMock();
    const run = jest.fn().mockResolvedValue(true);

    (workspace.openProject as jest.Mock).mockResolvedValue(projectMock);
    (ScannerPipelineFactory.getScannerPipeline as jest.Mock).mockReturnValue({ run });

    await projectService.reScan('/tmp/project');

    expect(workspace.openProject).toHaveBeenCalledTimes(1);
    expect(workspace.getProject).not.toHaveBeenCalled();
    expect(projectMock.metadata.getScannerConfig().mode).toBe(Scanner.ScannerMode.RESCAN);
    expect(projectMock.metadata.save).toHaveBeenCalledTimes(1);
    expect(run).toHaveBeenCalledWith(projectMock);
  });

  it('restores project state on rescan failure without reopening an already opened project', async () => {
    const projectMock = createProjectMock(ProjectState.OPENED);
    const run = jest.fn().mockRejectedValue(new Error('boom'));

    (workspace.openProject as jest.Mock).mockResolvedValue(projectMock);
    (ScannerPipelineFactory.getScannerPipeline as jest.Mock).mockReturnValue({ run });

    await expect(projectService.reScan('/tmp/project')).rejects.toThrow('boom');

    expect(projectMock.open).not.toHaveBeenCalled();
    expect(projectMock.save).toHaveBeenCalledTimes(1);
    expect(projectMock.close).toHaveBeenCalledTimes(1);
  });

  it('closes project and rethrows original scan error even if save fails in error path', async () => {
    const projectMock = createProjectMock(ProjectState.OPENED);
    const originalError = new Error('boom');
    const run = jest.fn().mockRejectedValue(originalError);
    projectMock.save.mockImplementation(() => {
      throw new Error('save failed');
    });

    (workspace.openProject as jest.Mock).mockResolvedValue(projectMock);
    (ScannerPipelineFactory.getScannerPipeline as jest.Mock).mockReturnValue({ run });

    await expect(projectService.reScan('/tmp/project')).rejects.toThrow('boom');

    expect(projectMock.save).toHaveBeenCalledTimes(1);
    expect(projectMock.close).toHaveBeenCalledTimes(1);
  });
});
