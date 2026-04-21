import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { Tree } from './tree/Tree';
import Node, { NodeStatus } from './tree/Node';
import File from './tree/File';

export const TREE_STATE_SCHEMA_VERSION = 2;
export const TREE_SNAPSHOT_FORMAT = 'jsonl-v1';
export const TREE_SNAPSHOT_FILENAME = 'tree.nodes.jsonl';
const SNAPSHOT_BUILD_CHUNK_SIZE = 2_000;

type SnapshotAction = 'scan' | 'filter';

interface ITreeSnapshotRootRecord {
  k: 'root';
  name: string;
  scanRoot?: string;
}

interface ITreeSnapshotFileRecord {
  k: 'f';
  p: string;
  s?: NodeStatus;
  o?: NodeStatus;
  a?: SnapshotAction;
  b?: 0 | 1;
  d?: 0 | 1;
  h?: string;
}

type ITreeSnapshotRecord = ITreeSnapshotRootRecord | ITreeSnapshotFileRecord;

export interface ITreeSnapshotRef {
  format: typeof TREE_SNAPSHOT_FORMAT;
  file: string;
}

interface IReadTreeSnapshotParams {
  projectPath: string;
  snapshotFile: string;
  defaultRootName: string;
  defaultScanRoot?: string;
}

const isNodeStatus = (value: unknown): value is NodeStatus =>
  value === NodeStatus.FILTERED
  || value === NodeStatus.MATCH
  || value === NodeStatus.NOMATCH
  || value === NodeStatus.PENDING
  || value === NodeStatus.IDENTIFIED
  || value === NodeStatus.IGNORED;

const normalizeNodeStatus = (value: unknown, fallback: NodeStatus): NodeStatus => {
  if (isNodeStatus(value)) return value;
  return fallback;
};

const normalizeAction = (value: unknown): SnapshotAction => (value === 'filter' ? 'filter' : 'scan');

const isFileRecord = (value: unknown): value is ITreeSnapshotFileRecord => {
  const record = value as Partial<ITreeSnapshotFileRecord>;
  return !!record && record.k === 'f' && typeof record.p === 'string' && record.p.length > 0;
};

const isRootRecord = (value: unknown): value is ITreeSnapshotRootRecord => {
  const record = value as Partial<ITreeSnapshotRootRecord>;
  return !!record && record.k === 'root' && typeof record.name === 'string' && record.name.length > 0;
};

const applyFileSnapshot = (file: File, record: ITreeSnapshotFileRecord) => {
  const action = normalizeAction(record.a);
  const original = normalizeNodeStatus(record.o, NodeStatus.NOMATCH);
  const defaultStatus = action === 'filter'
    ? NodeStatus.FILTERED
    : original === NodeStatus.MATCH
      ? NodeStatus.PENDING
      : original;
  const status = normalizeNodeStatus(record.s, defaultStatus);

  file.setAction(action);
  file.setOriginal(original);
  file.setStatus(file.getPath(), status);
  file.setIsBinaryFile(record.b === 1);
  file.setDependencyFile(record.d === 1);
  file.setMD5(record.h);
};

const rebuildFolderStatusFlags = (node: Node) => {
  if (node.getType() !== 'folder') return;
  for (let i = 0; i < node.getChildrenCount(); i += 1) {
    rebuildFolderStatusFlags(node.getChild(i));
  }
  node.updateStatusFlags();
  node.setStatusOnClassnameAs(node.getStatus());
};

const buildSnapshotFilePath = (projectPath: string, snapshotFile: string) => path.join(projectPath, snapshotFile);

export const isTreeSnapshotRef = (value: unknown): value is ITreeSnapshotRef => {
  const ref = value as Partial<ITreeSnapshotRef>;
  return !!ref && ref.format === TREE_SNAPSHOT_FORMAT && typeof ref.file === 'string' && ref.file.length > 0;
};

export const createTreeSnapshotRef = (): ITreeSnapshotRef => ({
  format: TREE_SNAPSHOT_FORMAT,
  file: TREE_SNAPSHOT_FILENAME,
});

export const writeTreeSnapshot = (
  projectPath: string,
  tree: Tree,
  snapshotFile: string = TREE_SNAPSHOT_FILENAME,
) => {
  const snapshotPath = buildSnapshotFilePath(projectPath, snapshotFile);
  const tempSnapshotPath = `${snapshotPath}.tmp.${process.pid}`;
  let fd: number | null = null;
  let persisted = false;

  try {
    fd = fs.openSync(tempSnapshotPath, 'w');
    const root = tree.getRootFolder();
    const rootRecord: ITreeSnapshotRootRecord = {
      k: 'root',
      name: root.getLabel(),
      scanRoot: tree.getRootPath(),
    };
    fs.writeSync(fd, `${JSON.stringify(rootRecord)}\n`);

    const stack: Node[] = [root];
    while (stack.length > 0) {
      const node = stack.pop();
      if (!node) continue;

      if (node.getType() === 'file') {
        const file = node as File;
        const fileRecord: ITreeSnapshotFileRecord = {
          k: 'f',
          p: file.getPath(),
          s: normalizeNodeStatus(file.getStatus(), NodeStatus.NOMATCH),
          o: normalizeNodeStatus(file.getOriginal(), NodeStatus.NOMATCH),
          a: normalizeAction(file.getAction()),
          b: file.getIsBinaryFile() ? 1 : 0,
          d: file.isDependency() ? 1 : 0,
          h: file.getMD5()
        };
        fs.writeSync(fd, `${JSON.stringify(fileRecord)}\n`);
        continue;
      }

      for (let i = node.getChildrenCount() - 1; i >= 0; i -= 1) {
        stack.push(node.getChild(i));
      }
    }
    fs.fsyncSync(fd);
    fs.closeSync(fd);
    fd = null;
    fs.renameSync(tempSnapshotPath, snapshotPath);
    persisted = true;
  } finally {
    if (fd !== null) {
      try {
        fs.closeSync(fd);
      } catch {
        // noop
      }
    }
    if (!persisted) {
      try {
        fs.unlinkSync(tempSnapshotPath);
      } catch {
        // noop
      }
    }
  }
};

export const readTreeSnapshot = async ({
  projectPath,
  snapshotFile,
  defaultRootName,
  defaultScanRoot,
}: IReadTreeSnapshotParams): Promise<Tree> => {
  const snapshotPath = buildSnapshotFilePath(projectPath, snapshotFile);
  const stream = fs.createReadStream(snapshotPath, { encoding: 'utf8' });
  const lineReader = readline.createInterface({
    input: stream,
    crlfDelay: Infinity,
  });

  let tree: Tree = null;
  let lineIndex = 0;
  let fileChunk: File[] = [];
  let fileRecords = new Map<string, ITreeSnapshotFileRecord>();
  const addedNodes = {};

  const flushBuildChunk = () => {
    if (!tree || fileChunk.length === 0) return;

    const recordsForChunk = fileRecords;
    tree.build(fileChunk, addedNodes, (file) => {
      const record = recordsForChunk.get(file.getPath());
      if (!record) return;
      applyFileSnapshot(file, record);
    });

    fileChunk = [];
    fileRecords = new Map<string, ITreeSnapshotFileRecord>();
  };

  for await (const rawLine of lineReader) {
    const line = rawLine.trim();
    if (!line) continue;

    let parsed: ITreeSnapshotRecord;
    try {
      parsed = JSON.parse(line);
    } catch (e) {
      throw new Error(`Invalid tree snapshot JSON at line ${lineIndex + 1}: ${(e as Error).message}`);
    }

    if (lineIndex === 0 && isRootRecord(parsed)) {
      tree = new Tree(
        parsed.name,
        projectPath,
        typeof parsed.scanRoot === 'string' ? parsed.scanRoot : defaultScanRoot,
      );
      lineIndex += 1;
      continue;
    }

    if (!tree) {
      tree = new Tree(defaultRootName, projectPath, defaultScanRoot);
    }

    if (!isFileRecord(parsed)) {
      lineIndex += 1;
      continue;
    }

    const name = parsed.p.split('/').pop();
    fileChunk.push(new File(parsed.p, name));
    fileRecords.set(parsed.p, parsed);

    if (fileChunk.length >= SNAPSHOT_BUILD_CHUNK_SIZE) {
      flushBuildChunk();
    }

    lineIndex += 1;
  }

  if (!tree) {
    tree = new Tree(defaultRootName, projectPath, defaultScanRoot);
  }
  flushBuildChunk();
  tree.orderTree();
  rebuildFolderStatusFlags(tree.getRootFolder());
  tree.updateFlags();

  return tree;
};
