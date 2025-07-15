import { IndexTreeTask } from './IndexTreeTask';
import fs from 'fs';
import { Tree } from '../../workspace/tree/Tree';
import path from 'path';

export class ResultFileTreeTask extends IndexTreeTask {

  filesToScan: Array<string>;

  private async saveResults(){
    const resultPath = path.join(this.project.getMyPath(),'result.json');
    const results = await fs.promises.readFile(this.project.getScanRoot(),'utf-8');
    await fs.promises.writeFile(resultPath, JSON.stringify(JSON.parse(results), null, 2));
  }

  private getFiles(): Array<string> {
    const results = this.getFileResultJsonContent();
    return Array.from(Object.keys(results));
  }

  private getFileResultJsonContent():Record<string, any>{
    const resultPath = path.join(this.project.getMyPath(), 'result.json');
    const resultJson = fs.readFileSync(resultPath, {encoding:'utf8'});
    return JSON.parse(resultJson);
  }

  public async run(): Promise<boolean> {
    await this.saveResults();
    const files = this.getFiles();
    this.filesToScan = files;
    const tree =  await this.buildTree(this.filesToScan);
    await this.setTreeSummary(tree);
    return true;
  }

  /**
   * @brief build tree from array of paths
   * @param files array of paths
   * @return Tree return a tree
   * */
  public async buildTree(files: Array<string>): Promise<Tree> {
    const tree = new Tree(this.project.metadata.getName(),this.project.getMyPath());
    tree.build(files);
    tree.orderTree();
    return tree;
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


