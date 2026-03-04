jest.mock('electron', () => ({
  app: {
    isPackaged: false,
    getVersion: jest.fn(() => '0.0.0-test'),
    getName: jest.fn(() => 'scanoss-workbench-test'),
  },
  dialog: {
    showMessageBox: jest.fn(),
  },
}));

jest.mock('electron-log', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  transports: {
    file: {
      resolvePath: jest.fn(),
    },
  },
}));

jest.mock('../../../services/RescanService', () => ({
  rescanService: {
    deleteUnusedComponents: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../../../services/TreeService', () => ({
  treeService: {
    getDependencyStatus: jest.fn().mockResolvedValue([
      { path: '/dep/a.ts', status: 'PENDING' },
      { path: '/dep/b.ts', status: 'IDENTIFIED' },
    ]),
  },
}));

jest.mock('../../../services/ModelProvider', () => ({
  modelProvider: {
    model: {
      inventory: {
        deleteDirtyDependencyInventories: jest.fn().mockResolvedValue(undefined),
      },
    },
  },
}));

import { ReScanDependencyTask } from './ReScanDependencyTask';
import { DependencyTask } from './DependencyTask';
import { rescanService } from '../../../services/RescanService';
import { treeService } from '../../../services/TreeService';
import { modelProvider } from '../../../services/ModelProvider';

describe('ReScanDependencyTask', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('updates tree dependency status and persists snapshot through Project APIs', async () => {
    jest.spyOn(DependencyTask.prototype, 'run').mockResolvedValue(true);
    const setStatus = jest.fn();
    const project: any = {
      tree: {
        getRootFolder: () => ({
          setStatus,
        }),
      },
      saveWithSnapshot: jest.fn(),
    };

    const task = new ReScanDependencyTask(project);
    await task.run();

    expect(modelProvider.model.inventory.deleteDirtyDependencyInventories).toHaveBeenCalled();
    expect(rescanService.deleteUnusedComponents).toHaveBeenCalled();
    expect(treeService.getDependencyStatus).toHaveBeenCalled();
    expect(setStatus).toHaveBeenCalledWith('/dep/a.ts', 'PENDING');
    expect(setStatus).toHaveBeenCalledWith('/dep/b.ts', 'IDENTIFIED');
    expect(project.saveWithSnapshot).toHaveBeenCalled();
  });
});
