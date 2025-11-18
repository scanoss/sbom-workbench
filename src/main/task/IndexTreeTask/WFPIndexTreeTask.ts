import fs from "fs";
import { IndexTreeTask } from "./IndexTreeTask";
import { Tree } from "../../workspace/tree/Tree";
import { createReadStream } from "fs";
import { createInterface } from "readline";

export class WFPIndexTreeTask extends IndexTreeTask {

  filesToScan: Array<string>;

  public async run(): Promise<boolean> {
    const tree = await this.buildTreeFromStream();
    await this.setTreeSummary(tree);
    return true;
  }

  /**
   * @brief build tree from WFP file using streaming with chunked processing
   * @return Tree return a tree
   * */
  public async buildTreeFromStream(): Promise<Tree> {
    const tree = new Tree(this.project.metadata.getName(), this.project.getMyPath());
    const filesToScan: Array<string> = [];
    const regex = /file=.*,.*,(?<path>.*)/;

    return new Promise((resolve, reject) => {
      try {
        const fileStream = createReadStream(this.project.getScanRoot(), { encoding: 'utf8' });
        const rl = createInterface({
          input: fileStream,
          crlfDelay: Infinity
        });

        const CHUNK_SIZE = 1000;
        let fileChunk: string[] = [];

        rl.on('line', (line) => {
          const match = regex.exec(line);
          if (match && match.groups.path) {
            const filePath = match.groups.path;
            filesToScan.push(filePath);
            fileChunk.push(filePath);

            // Process chunk when it reaches CHUNK_SIZE
            if (fileChunk.length >= CHUNK_SIZE) {
              tree.build(fileChunk);
              fileChunk = []; // Clear chunk
            }
          }
        });

        rl.on('close', () => {
          // Process remaining files in the last chunk
          if (fileChunk.length > 0) {
            tree.build(fileChunk);
          }

          this.filesToScan = filesToScan;
          tree.orderTree();
          resolve(tree);
        });

        rl.on('error', (err) => {
          reject(new Error(`Error reading WFP file: ${err.message}`));
        });
      } catch (e) {
        reject(new Error(`WFP file does not exist in: ${this.project.getScanRoot()}`));
      }
    });
  }

  public setTreeSummary(tree: Tree):void {
    this.project.filesToScan = this.filesToScan.reduce((acc,curr)=> { if(!acc[curr])acc[curr]=null; return acc; },{});
    this.project.filesSummary = { total: this.filesToScan.length, include: this.filesToScan.length, filter: 0, files: Object.assign(this.project.filesToScan) } ;
    this.project.filesNotScanned = {};
    this.project.processedFiles = 0;
    this.project.setTree(tree);
    this.project.metadata.setFileCounter(this.filesToScan.length);
    this.project.save();
  }

}


