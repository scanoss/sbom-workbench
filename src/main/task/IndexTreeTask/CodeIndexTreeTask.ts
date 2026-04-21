import log from 'electron-log';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import crypto from 'crypto';
import { IndexTreeTask } from "./IndexTreeTask";
import * as Filtering from '../../workspace/filtering';
import { Tree } from '../../workspace/tree/Tree';
import File from '../../workspace/tree/File';
import { fileService } from '../../services/FileService';
import { createFilesSummary } from '../../workspace/projectScanState';
import { CollectFilesVisitor } from '../../workspace/tree/visitor/CollectFilesVisitor';

export class CodeIndexTreeTask extends IndexTreeTask {

  public async run(params: void):Promise<boolean> {
    log.info('[ CodeIndexTreeTask init ]');
    const tree = await this.buildTreeFromDirectory();
    this.setTreeSummary(tree);
    tree.orderTree();
    const collector = new CollectFilesVisitor();
    tree.getRootFolder().accept<void>(collector);
    await fileService.insert(collector.files);
    log.info('[ CodeIndexTreeTask end ]');
    return true;
  }

  /**
   * Recursively scan directory and build tree in chunks
   */
  private async buildTreeFromDirectory(): Promise<Tree> {
    const tree = new Tree(
      this.project.metadata.getName(),
      this.project.getMyPath(),
      this.project.metadata.getScanRoot()
    );

    const CHUNK_SIZE = 1000;
    let fileChunk: File[] = [];
    const addedNodes = {}; // Shared across all chunks to prevent duplicate folders

    const scanRoot = this.project.getScanRoot();

    const buildFileNode = (relativePath: string, absolutePath: string): File => {
      const name = relativePath.split('/').pop();
      const file = new File(relativePath, name);
      try {
        const hash = crypto.createHash('md5');
        hash.update(fs.readFileSync(absolutePath));
        file.setMD5(hash.digest('hex'));
      } catch (err) {
        log.warn(`[ CodeIndexTreeTask ]: Failed to compute md5 for ${relativePath}`, err);
      }
      return file;
    };

    const scanDirectory = async (dir: string, rootPath: string) => {
      try {
        const dirHandle = await fsPromises.opendir(dir);

        for await (const dirent of dirHandle) {
          // Skip symbolic links
          if (dirent.isSymbolicLink()) continue;

          const absolutePath = `${dir}/${dirent.name}`;
          const relativePath = absolutePath.replace(rootPath, '');

          if (dirent.isDirectory()) {
            // Recursively scan subdirectory
            await scanDirectory(absolutePath, rootPath);
          } else {
            fileChunk.push(buildFileNode(relativePath, absolutePath));

            // Process chunk when it reaches CHUNK_SIZE
            if (fileChunk.length >= CHUNK_SIZE) {
              tree.build(fileChunk, addedNodes);
              fileChunk = []; // Clear chunk
            }
          }
        }
      } catch (err) {
        log.error(`Error scanning directory ${dir}:`, err);
      }
    };

    // Start scanning from root

    await scanDirectory(scanRoot, scanRoot);

    // Process remaining files in the last chunk
    if (fileChunk.length > 0) {
      tree.build(fileChunk, addedNodes);
    }

    if (this.project.metadata.getScannerConfig()?.allExtensions) {
      tree.setFilter(new Filtering.BannedList('NoFilter'));
    } else {
      tree.setFilter();
    }
    return tree;
  }

  public setTreeSummary(tree: Tree):void {
    tree.summarize();
    const summary = tree.getSummarize();
    this.project.filesToScan = summary.files;
    this.project.filesSummary = createFilesSummary(summary.total, summary.include, summary.filter);
    this.project.filesNotScanned = {};
    this.project.processedFiles = 0;
    this.project.metadata.setFileCounter(summary.total);
    this.project.setTree(tree);
    this.project.saveWithSnapshot();
  }

}
