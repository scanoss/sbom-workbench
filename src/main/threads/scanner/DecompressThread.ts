import { DecompressionManager } from 'scanoss';
import path from 'path';
import fs from 'fs';

export interface DecompressThreadOptions {
  recursive: boolean;
  maxDepth: number;
}

export interface DecompressThreadResult {
  parentFolders: Array<string>;
  failedFiles: Array<{ path: string, error: string }>;
  skippedByDepth: Array<{ path: string, error: string }>;
}

export class DecompressThread {
  private projectScanRoot: string;

  private decompressionManager: DecompressionManager;

  private effectiveDepth: number;

  constructor(projectScanRoot: string, options: DecompressThreadOptions) {
    this.projectScanRoot = projectScanRoot;
    // effectiveDepth = total nesting levels the SDK is allowed to expand.
    // 1 = single-pass (top-level archives only).
    this.effectiveDepth = options.recursive ? options.maxDepth : 1;
    this.decompressionManager = new DecompressionManager(this.effectiveDepth);
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

  public async run(): Promise<DecompressThreadResult> {
    const supportedFormats = this.decompressionManager.getSupportedFormats();
    const candidates = this.getFilesToDecompress(this.projectScanRoot, supportedFormats);
    const result = await this.decompressionManager.decompress(candidates);

    const skippedByDepth = result.skippedByDepth.map((p) => ({
      path: p,
      error: `Archive not expanded: nesting exceeds configured depth (${this.effectiveDepth})`,
    }));

    return {
      parentFolders: result.parentFolders,
      failedFiles: result.failedFiles,
      skippedByDepth,
    };
  }
}
