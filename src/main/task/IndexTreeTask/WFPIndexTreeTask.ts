import fs from "fs";
import { IndexTreeTask } from "./IndexTreeTask";
import { Tree } from "../../workspace/tree/Tree";
import File from "../../workspace/tree/File";
import { createReadStream } from "fs";
import { createInterface } from "readline";
import { createFilesSummary } from '../../workspace/projectScanState';

export class WFPIndexTreeTask extends IndexTreeTask {

  filesToScan: Array<string>;

  public async run(): Promise<boolean> {
    const tree = await this.buildTree();
    await this.setTreeSummary(tree);
    return true;
  }

  /**
   * @brief build tree from WFP file using streaming with chunked processing
   * @return Tree return a tree
   * */
  public async buildTree(): Promise<Tree> {
    const tree = new Tree(this.project.metadata.getName(), this.project.getMyPath());
    const filesToScan: Array<string> = [];
    const regex = /file=(?<md5>[^,]*),[^,]*,(?<path>.*)/;

    return new Promise((resolve, reject) => {
      // In WFP projects, getScanRoot() returns the path to the WFP file (not a directory)
      const fileStream = createReadStream(this.project.getScanRoot(), { encoding: 'utf8' });
      const rl = createInterface({
        input: fileStream,
        crlfDelay: Infinity
      });

      const CHUNK_SIZE = 1000;
      let fileChunk: File[] = [];
      const addedNodes = {}; // Shared across all chunks to prevent duplicate folders

      rl.on('line', (line) => {
        const match = regex.exec(line);
        if (match && match.groups.path) {
          const filePath = match.groups.path;
          const nodePath = filePath.startsWith('/') ? filePath : `/${filePath}`;
          const name = nodePath.split('/').pop();
          const file = new File(nodePath, name);
          file.setMD5(match.groups.md5);
          filesToScan.push(filePath);
          fileChunk.push(file);

          // Process chunk when it reaches CHUNK_SIZE
          if (fileChunk.length >= CHUNK_SIZE) {
            tree.build(fileChunk, addedNodes);
            fileChunk = []; // Clear chunk
          }
        }
      });

      rl.on('close', () => {
        // Process remaining files in the last chunk
        if (fileChunk.length > 0) {
          tree.build(fileChunk, addedNodes);
        }

        this.filesToScan = filesToScan;
        tree.orderTree();
        resolve(tree);
      });

      rl.on('error', (err) => {
        reject(new Error(`Error reading WFP file: ${err.message}`));
      });
    });
  }

  public setTreeSummary(tree: Tree):void {
    this.project.filesToScan = this.filesToScan.reduce((acc,curr)=> { if(!acc[curr])acc[curr]=null; return acc; },{});
    this.project.filesSummary = createFilesSummary(this.filesToScan.length, this.filesToScan.length, 0);
    this.project.filesNotScanned = {};
    this.project.processedFiles = 0;
    this.project.setTree(tree);
    this.project.metadata.setFileCounter(this.filesToScan.length);
    this.project.saveWithSnapshot();
  }

}
