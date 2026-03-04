import fs from 'fs';
import os from 'os';
import path from 'path';
import { Tree } from './tree/Tree';
import { NodeStatus } from './tree/Node';
import File from './tree/File';
import { readTreeSnapshot, writeTreeSnapshot } from './projectTreeSnapshot';

describe('projectTreeSnapshot', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'snapshot-tree-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('roundtrips file attributes and folder status flags using jsonl snapshot', async () => {
    const tree = new Tree('demo-root', tempDir, '/scan/root');
    tree.build(['/src/a.ts', '/src/b.bin', '/deps/c.js']);

    const fileA = tree.getNode('/src/a.ts') as File;
    fileA.setAction('scan');
    fileA.setOriginal(NodeStatus.MATCH);
    fileA.setStatus(fileA.getPath(), NodeStatus.PENDING);

    const fileB = tree.getNode('/src/b.bin') as File;
    fileB.setAction('filter');
    fileB.setOriginal(NodeStatus.NOMATCH);
    fileB.setStatus(fileB.getPath(), NodeStatus.FILTERED);
    fileB.setIsBinaryFile(true);

    const fileC = tree.getNode('/deps/c.js') as File;
    fileC.setAction('scan');
    fileC.setOriginal(NodeStatus.MATCH);
    fileC.setStatus(fileC.getPath(), NodeStatus.IDENTIFIED);
    fileC.setDependencyFile(true);

    writeTreeSnapshot(tempDir, tree);

    const loaded = await readTreeSnapshot({
      projectPath: tempDir,
      snapshotFile: 'tree.nodes.jsonl',
      defaultRootName: 'fallback',
      defaultScanRoot: '/fallback/root',
    });

    const loadedA = loaded.getNode('/src/a.ts') as File;
    expect(loadedA.getStatus()).toBe(NodeStatus.PENDING);
    expect(loadedA.getOriginal()).toBe(NodeStatus.MATCH);
    expect(loadedA.getAction()).toBe('scan');

    const loadedB = loaded.getNode('/src/b.bin') as File;
    expect(loadedB.getStatus()).toBe(NodeStatus.FILTERED);
    expect(loadedB.getAction()).toBe('filter');
    expect(loadedB.getIsBinaryFile()).toBe(true);

    const loadedC = loaded.getNode('/deps/c.js') as File;
    expect(loadedC.getStatus()).toBe(NodeStatus.IDENTIFIED);
    expect(loadedC.isDependency()).toBe(true);

    expect(loaded.getRootFolder().getStatus()).toBe(NodeStatus.PENDING);
  });
});
