import { IndexTreeTask } from './IndexTreeTask';
import fs from 'fs';
import { Tree } from '../../workspace/tree/Tree';

export class ResultFileTreeTask extends IndexTreeTask {

  filesToScan: Array<string>;

  public async run(): Promise<boolean> {
    const files = this.getFiles();
    this.filesToScan = files;
    const tree =  await this.buildTree(this.filesToScan);
    await this.setTreeSummary(tree);
    return true;
  }

  private getFiles(): Array<string> {
    const results = this.getFileResultJsonContent();
    return Array.from(Object.keys(results));
  }

  private getFileResultJsonContent():Record<string, any>{
    const resultJson = fs.readFileSync(this.project.getScanRoot(),
      {encoding:'utf8'});
    return JSON.parse(resultJson);
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


