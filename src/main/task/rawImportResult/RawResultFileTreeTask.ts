import { IndexTreeTask } from '../IndexTreeTask/IndexTreeTask';
import fs from 'fs';
import { Tree } from '../../workspace/tree/Tree';
import path from 'path';
import log from 'electron-log';
import { parser } from 'stream-json';
import { streamObject } from 'stream-json/streamers/StreamObject';

export class RawResultFileTreeTask extends IndexTreeTask {

  filesToScan: Array<string>;


  private async buildTreeInChunks(): Promise<Tree> {
    const resultPath = path.join(this.project.getMyPath(), 'result.json');
    const tree = new Tree(this.project.metadata.getName(), this.project.getMyPath());
    const files: Array<string> = [];

    const pipeline = fs.createReadStream(resultPath)
      .pipe(parser())
      .pipe(streamObject());

    const CHUNK_SIZE = 1000;
    let fileChunk: string[] = [];

    return new Promise((resolve, reject) => {
      pipeline.on('data', ({ key }) => {
        files.push(key);
        fileChunk.push(key);

        // Process chunk when it reaches CHUNK_SIZE
        if (fileChunk.length >= CHUNK_SIZE) {
          tree.build(fileChunk);
          fileChunk = []; // Clear chunk
        }
      });

      pipeline.on('end', () => {
        // Process remaining files in the last chunk
        if (fileChunk.length > 0) {
          tree.build(fileChunk);
        }

        this.filesToScan = files;
        tree.orderTree();
        resolve(tree);
      });

      pipeline.on('error', (err) => {
        log.error('[ Error reading file list from result.json ]', err);
        reject(err);
      });
    });
  }

  private async loadScanResultsOnFileTree(): Promise<void> {
    log.info('[ Loading scan results on file tree... ]');
    const resultPath = path.join(this.project.getMyPath(), 'result.json');
    const pipeline = fs.createReadStream(resultPath)
      .pipe(parser())
      .pipe(streamObject());

    return new Promise((resolve, reject) => {
      pipeline.on('data', ({ key, value }) => {
        this.project.tree.attachResults({[key]: value});
      });

      pipeline.on('end', () => {
        // Update flags once at the end instead of for every file
        this.project.tree.updateFlags();
        resolve();
      });

      pipeline.on('error', (err) => {
        log.error('[ Error loading scan results ]', err);
        reject(err);
      });
    });
  }

  public async run(): Promise<boolean> {
    const tree = await this.buildTreeInChunks();
    this.setTreeSummary(tree);
    await this.loadScanResultsOnFileTree();
    return true;
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


