import { IndexTreeTask } from "./IndexTreeTask";
import { Tree } from "../../workspace/tree/Tree";
import log from 'electron-log';
import { promises as fsPromises } from 'fs';

export class CodeIndexTreeTask  extends IndexTreeTask {

  public async run(params: void):Promise<boolean> {
    log.info('[ CodeIndexTreeTask init ]');
    const tree = await this.buildTreeFromDirectory();
    this.setTreeSummary(tree);
    tree.orderTree();
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
    let fileChunk: string[] = [];
    const addedNodes = {}; // Shared across all chunks to prevent duplicate folders

    const scanDirectory = async (dir: string, rootPath: string) => {
      try {
        const dirHandle = await fsPromises.opendir(dir);

        for await (const dirent of dirHandle) {
          // Skip symbolic links
          if (dirent.isSymbolicLink()) continue;

          const relativePath = `${dir}/${dirent.name}`.replace(rootPath, '');

          if (dirent.isDirectory()) {
            // Recursively scan subdirectory
            await scanDirectory(`${dir}/${dirent.name}`, rootPath);
          } else {
            // Add file to chunk
            fileChunk.push(relativePath);

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

    await scanDirectory(this.project.getScanRoot(), this.project.getScanRoot());

    // Process remaining files in the last chunk
    if (fileChunk.length > 0) {
      tree.build(fileChunk, addedNodes);
    }

    tree.setFilter();
    return tree;
  }

  public async buildTree(files: Array<string>): Promise<Tree> {
    const tree = new Tree(this.project.metadata.getName(),this.project.getMyPath(),this.project.metadata.getScanRoot());
    tree.build(files);
    tree.setFilter();
    return tree;
  }

  public setTreeSummary(tree: Tree):void {
    tree.summarize();
    const summary = tree.getSummarize();
    this.project.filesToScan = summary.files;
    this.project.filesSummary = summary;
    this.project.filesNotScanned = {};
    this.project.processedFiles = 0;
    this.project.metadata.setFileCounter(summary.total);
    this.project.setTree(tree);
    this.project.save();
  }

}
