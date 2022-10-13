import { DecompressionManager } from 'scanoss';
import path from 'path';
import fs from 'fs';
import { ITask } from '../Task';
import { Project } from '../../workspace/Project';

export class DecompressTask implements ITask<Project, boolean> {
  private decompressionManager: DecompressionManager;

  constructor() {
    this.decompressionManager = new DecompressionManager();
  }

  public async run(project: Project): Promise<boolean> {
    try {
      const filesToDecompress = this.getFilesToDecompress(
        project.getScanRoot(),
        this.decompressionManager.getSupportedFormats()
      );
      await this.decompressionManager.decompress(filesToDecompress);
      await new Promise((resolve) => setTimeout(resolve, 3000));
      return true;
    } catch (error: any) {
      console.log(error);
      return false;
    }
  }

  /**
   * Find all files recursively in specific folder with specific extension, e.g:
   * findFilesInDir('./project/src', '.html') ==> ['./project/src/a.html','./project/src/build/index.html']
   * @param  {String} startPath    Path relative to this file or other file which requires this files
   * @param  {String} extensions       Extension name, e.g: '.html'
   * @return {Array}               Result files with path string in an array
   */
  private getFilesToDecompress(
    startPath: string,
    extensions: Array<string>
  ): Array<string> {
    let results = [];
    if (!fs.existsSync(startPath)) {
      return [];
    }
    const files = fs.readdirSync(startPath);
    for (let i = 0; i < files.length; i++) {
      const filename = path.join(startPath, files[i]);
      const stat = fs.lstatSync(filename);
      if (stat.isDirectory()) {
        results = results.concat(
          this.getFilesToDecompress(filename, extensions)
        ); //  recurse
      } else if (extensions.includes(path.extname(filename))) {
        results.push(filename);
      }
    }
    return results;
  }
}
