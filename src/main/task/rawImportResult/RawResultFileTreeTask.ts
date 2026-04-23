import { IndexTreeTask } from '../IndexTreeTask/IndexTreeTask';
import fs from 'fs';
import { Tree } from '../../workspace/tree/Tree';
import File from '../../workspace/tree/File';
import path from 'path';
import log from 'electron-log';
import { parser } from 'stream-json';
import { streamObject } from 'stream-json/streamers/StreamObject';
import { createFilesSummary } from '../../workspace/projectScanState';

export class RawResultFileTreeTask extends IndexTreeTask {

  filesToScan: Array<string>;


  public async buildTree(): Promise<Tree> {
    const resultPath = path.join(this.project.getMyPath(), 'result.json');
    const tree = new Tree(this.project.metadata.getName(), this.project.getMyPath());
    const files: Array<string> = [];

    const pipeline = fs.createReadStream(resultPath)
      .pipe(parser())
      .pipe(streamObject());

    const CHUNK_SIZE = 1000;
    let fileChunk: File[] = [];
    const addedNodes = {}; // Shared across all chunks to prevent duplicate folders

    return new Promise((resolve, reject) => {
      pipeline.on('data', ({ key, value }) => {
        const nodePath = key.startsWith('/') ? key : `/${key}`;
        const name = nodePath.split('/').pop();
        const file = new File(nodePath, name);
        const sourceHash = Array.isArray(value)
          ? value.find((v: any) => v?.source_hash)?.source_hash
          : undefined;
        if (sourceHash) file.setMD5(sourceHash);
        files.push(key);
        fileChunk.push(file);

        // Process chunk when it reaches CHUNK_SIZE
        if (fileChunk.length >= CHUNK_SIZE) {
          tree.build(fileChunk, addedNodes);
          fileChunk = []; // Clear chunk
        }
      });

      pipeline.on('end', () => {
        // Process remaining files in the last chunk
        if (fileChunk.length > 0) {
          tree.build(fileChunk, addedNodes);
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
    const tree = await this.buildTree();
    this.setTreeSummary(tree);
    await this.loadScanResultsOnFileTree();
    return true;
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
