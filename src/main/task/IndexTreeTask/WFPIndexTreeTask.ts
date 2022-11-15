import fs from "fs";
import { IndexTreeTask } from "./IndexTreeTask";
import { Tree } from "../../workspace/tree/Tree";

export class WFPIndexTreeTask extends IndexTreeTask {

  filesToScan: Array<string>;

  public async run(): Promise<boolean> {
    const files = this.getFiles();
    console.log(files);
    this.filesToScan = files;
    const tree =  await this.buildTree(this.filesToScan);
    await this.setTreeSummary(tree);
    return true;
  }

  private getFiles(): Array<string> {
    const wfp = this.getWFPContent();
    const regex = new RegExp(/^file=\w+,\w+,(?<path>.+$)/gm);
    const files = [];
    let result = regex.exec(wfp);
    while (result !== null) {
      files.push(result.groups.path);
      result = regex.exec(wfp);
    }
    return files;
  }


  private getWFPContent():string {
   const wfp = fs.readFileSync(this.project.getScanRoot(),
      {encoding:'utf8'});
    return wfp;
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


