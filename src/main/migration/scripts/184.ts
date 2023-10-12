import fs from 'fs';
import path from 'path';
import { Metadata } from '../../workspace/Metadata';

export async function projectMigration184(projectPath: string): Promise<void> {
  const metadataPath = path.join(projectPath, 'metadata.json');
  const metadataRaw = await fs.promises.readFile(metadataPath, 'utf-8');
  const metadata = JSON.parse(metadataRaw);
  const m = await Metadata.readFromPath(metadata.name);
  const absoluteWorkRoot = m.getMyPath();
  const relativeWorkRoot = absoluteWorkRoot.split(path.sep);
  m.setMyPath(relativeWorkRoot[relativeWorkRoot.length - 1]);
  m.save();
}
