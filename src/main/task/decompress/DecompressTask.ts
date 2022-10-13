import { DecompressionManager } from 'scanoss';
import { ITask } from '../Task';
import { Project } from '../../workspace/Project';
import { ExtensionFilter } from '../../workspace/tree/blackList/ExtensionFilter';
import Folder from '../../workspace/tree/Folder';
import path from 'path';
import Node from '../../workspace/tree/Node';
import fs from 'fs';
import File from '../../workspace/tree/File';

export class DecompressTask implements ITask<Project, boolean> {
  private decompresionManager: DecompressionManager;

  constructor() {
    this.decompresionManager = new DecompressionManager();
  }

  public async run(project: Project): Promise<boolean> {
    const filesToDecompress = this.getFilesToDecompress(project);
    const decompressedPaths = await this.decompresionManager.decompress(
      filesToDecompress
    );

    decompressedPaths.forEach((dp) => {
      const newPath = path.basename(dp);
      const folder = project
        .getTree()
        .buildTreeRec(dp, new Folder(`/${newPath}`, newPath), dp);
      folder.setAction('scan');
      project.getTree().getRootFolder().addChild(folder);
    });
    return true;
  }

  private getFilesToDecompress(project: Project) {
    const supportedFiles = this.decompresionManager.getSupportedFormats();
    const tree = project.getTree();
    const filesToDecompress = tree
      .getRootFolder()
      .getFiles(new ExtensionFilter(supportedFiles));
    return filesToDecompress.map(
      (file) => `${project.getScanRoot()}${file.path}`
    );
  }
}
