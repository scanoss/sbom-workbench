import { DecompressionManager } from 'scanoss';
import path from 'path';
import fs from 'fs';

export class DecompressThread {
  private projectScanRoot: string;

  private decompressionManager: DecompressionManager;

  constructor(projectScanRoot: string) {
    this.projectScanRoot = projectScanRoot;
    this.decompressionManager = new DecompressionManager();
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
      } else if (extensions.some((format) => filename.endsWith(format))) {
        results.push(filename);
      }
    }
    return results;
  }

  public async run(): Promise<{ parentFolders: Array<string>, failedFiles: Array<{ path: string, error: string }> }> {
    const filesToDecompress = this.getFilesToDecompress(
      this.projectScanRoot,
      this.decompressionManager.getSupportedFormats()
    );
    return await this.decompressionManager.decompress(filesToDecompress);
  }
}
