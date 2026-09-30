/**
 * @jest-environment node
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import { Scanner } from '../task/scanner/types';

const mockSourcePath = { value: '' };

jest.mock('electron-log', () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() }));
jest.mock('../workspace/Workspace', () => ({
  workspace: { getOpenProject: () => ({ getSourceCodePath: () => mockSourcePath.value }) },
}));
jest.mock('../task/scanner/scannerPipelineFactory/ScannerPipelineFactory', () => ({
  ScannerPipelineFactory: { getScannerPipeline: jest.fn() },
}));
jest.mock('./UserSettingService', () => ({
  userSettingService: {
    get: jest.fn(() => ({ DEFAULT_WORKSPACE_INDEX: 0, WORKSPACES: [{ SCAN_SOURCES: '/', PATH: '/' }] })),
  },
}));
jest.mock('../task/search/indexTask/IndexTask', () => ({ IndexTask: jest.fn() }));

/* eslint-disable import/first */
import { IndexTask } from '../task/search/indexTask/IndexTask';
import { projectService } from './ProjectService';
/* eslint-enable import/first */

describe('ProjectService.rebuildOutdatedSearchIndex', () => {
  let root: string;
  const run = jest.fn();

  const project = (stages = [Scanner.PipelineStage.CODE, Scanner.PipelineStage.SEARCH_INDEX]) => ({
    getMyPath: () => root,
    getSourceCodePath: () => mockSourcePath.value,
    metadata: { getScannerConfig: () => ({ pipelineStages: stages }) },
  }) as any;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'rebuild-index-'));
    mockSourcePath.value = root;
    run.mockReset().mockResolvedValue(true);
    (IndexTask as unknown as jest.Mock).mockReset().mockImplementation(() => ({ run }));
  });

  afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

  it('rebuilds a legacy dictionary when the source is available', async () => {
    await projectService.rebuildOutdatedSearchIndex(project());
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('skips current dictionaries, disabled index stages and missing sources', () => {
    fs.mkdirSync(path.join(root, 'dictionary'));
    fs.writeFileSync(path.join(root, 'dictionary', 'version.json'), JSON.stringify({ version: 2 }));
    expect(projectService.rebuildOutdatedSearchIndex(project())).toBeNull();
    fs.rmSync(path.join(root, 'dictionary'), { recursive: true });

    expect(projectService.rebuildOutdatedSearchIndex(project([Scanner.PipelineStage.CODE]))).toBeNull();

    mockSourcePath.value = '';
    expect(projectService.rebuildOutdatedSearchIndex(project())).toBeNull();
    expect(run).not.toHaveBeenCalled();
  });

  it('runs one rebuild at a time per project, also after a failure', async () => {
    let fail: (e: Error) => void;
    run.mockImplementationOnce(() => new Promise((_resolve, reject) => { fail = reject; }));
    const first = projectService.rebuildOutdatedSearchIndex(project());
    expect(projectService.rebuildOutdatedSearchIndex(project())).toBeNull();
    fail(new Error('boom'));
    await first;
    await projectService.rebuildOutdatedSearchIndex(project());
    expect(run).toHaveBeenCalledTimes(2);
  });
});
