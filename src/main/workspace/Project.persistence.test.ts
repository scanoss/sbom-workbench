import fs from 'fs';
import os from 'os';
import path from 'path';

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

jest.mock('../services/ModelProvider', () => ({
  modelProvider: {
    init: jest.fn().mockResolvedValue(undefined),
  },
}));

import { Project } from './Project';
import { Tree } from './tree/Tree';
import { Metadata } from './Metadata';
import { modelProvider } from '../services/ModelProvider';
import { NodeStatus } from './tree/Node';
import File from './tree/File';
import { createTreeSnapshotRef, writeTreeSnapshot } from './projectTreeSnapshot';

describe('Project persistence schema v2', () => {
  let tempDir: string;

  const createMetadataMock = (projectPath: string) => ({
    save: jest.fn(),
    getMyPath: jest.fn(() => projectPath),
    getName: jest.fn(() => 'demo-project'),
    getScanRoot: jest.fn(() => '/scan/root'),
  });

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'project-persist-'));
  });

  afterEach(() => {
    jest.restoreAllMocks();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('save writes compact tree.json and persists snapshot sidecar', () => {
    const project = new Project('demo-project');
    const metadataMock = createMetadataMock(tempDir);
    (project as any).metadata = metadataMock;
    project.filesToScan = { '/src/a.ts': 'FULL_SCAN' };
    project.filesSummary = { total: 1, include: 1, filter: 0 };
    project.filesNotScanned = {};
    project.processedFiles = 0;

    const tree = new Tree('demo-project', tempDir, '/scan/root');
    tree.build([new File('/src/a.ts', 'a.ts')]);
    project.setTree(tree);

    project.save();

    const persisted = JSON.parse(fs.readFileSync(path.join(tempDir, 'tree.json'), 'utf8'));
    expect(persisted.schemaVersion).toBe(2);
    expect(persisted.tree).toBeUndefined();
    expect(persisted.treeSnapshot).toEqual(createTreeSnapshotRef());
    expect(fs.existsSync(path.join(tempDir, 'tree.nodes.jsonl'))).toBe(true);
  });

  it('open keeps backward compatibility with legacy embedded tree payload', async () => {
    const legacyTree = new Tree('legacy-root', tempDir, '/scan/root');
    legacyTree.build([new File('/legacy/a.ts', 'a.ts')]);
    const legacyPayload = {
      filesToScan: { '/legacy/a.ts': 'FULL_SCAN' },
      filesNotScanned: {},
      processedFiles: 0,
      filesSummary: { total: 1, include: 1, filter: 0 },
      tree: {
        rootFolder: legacyTree.getRootFolder(),
      },
    };
    fs.writeFileSync(path.join(tempDir, 'tree.json'), JSON.stringify(legacyPayload));

    const project = new Project('demo-project');
    const metadataMock = createMetadataMock(tempDir);
    (project as any).metadata = metadataMock;
    jest.spyOn(Metadata, 'readFromPath').mockResolvedValue(metadataMock as any);

    await project.open();

    expect((modelProvider.init as jest.Mock).mock.calls.length).toBeGreaterThan(0);
    expect(project.getTree().getNode('/legacy/a.ts')).not.toBeNull();
  });

  it('open loads schemaVersion=2 state and tree snapshot sidecar', async () => {
    const tree = new Tree('snapshot-root', tempDir, '/scan/root');
    tree.build([new File('/snapshot/a.ts', 'a.ts')]);
    const file = tree.getNode('/snapshot/a.ts') as any;
    file.setAction('scan');
    file.setOriginal(NodeStatus.MATCH);
    file.setStatus('/snapshot/a.ts', NodeStatus.PENDING);
    writeTreeSnapshot(tempDir, tree);

    const stateV2 = {
      schemaVersion: 2,
      filesToScan: { '/snapshot/a.ts': 'FULL_SCAN' },
      filesNotScanned: {},
      processedFiles: 0,
      filesSummary: { total: 1, include: 1, filter: 0 },
      treeSnapshot: createTreeSnapshotRef(),
    };
    fs.writeFileSync(path.join(tempDir, 'tree.json'), JSON.stringify(stateV2));

    const project = new Project('demo-project');
    const metadataMock = createMetadataMock(tempDir);
    (project as any).metadata = metadataMock;
    jest.spyOn(Metadata, 'readFromPath').mockResolvedValue(metadataMock as any);

    await project.open();

    const loadedFile: any = project.getTree().getNode('/snapshot/a.ts');
    expect(loadedFile).not.toBeNull();
    expect(loadedFile.getStatus()).toBe(NodeStatus.PENDING);
    expect(loadedFile.getOriginal()).toBe(NodeStatus.MATCH);
  });
});
