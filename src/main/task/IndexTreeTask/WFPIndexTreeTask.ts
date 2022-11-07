import fs from "fs";
import { IndexTreeTask } from "./IndexTreeTask";
import {Tree} from "../../workspace/tree/Tree";

export class WFPIndexTreeTask extends IndexTreeTask {

  filesToScan: Array<string>;

  public async run(): Promise<boolean> {
    const files = this.getFiles();
    this.filesToScan = files;
    const tree =  await this.buildTree(files);
    await this.setTreeSummary(tree);
    return true;
  }

  private getFiles(): Array<string>{
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


  private getWFPContent(){
    console.log(this.project.getScanRoot());
    const wfp = fs.readFileSync(this.project.getScanRoot(),
      {encoding:'utf8'});
    return wfp;
  }

  public async buildTree(files: Array<string>): Promise<Tree>{
    const tree = new Tree(this.project.metadata.getName(),this.project.getMyPath());
    tree.build(files);
    return tree;
 }

  public async setTreeSummary(tree: Tree){
    this.project.filesToScan = this.filesToScan;
    this.project.filesSummary = { total: this.filesToScan.length, include: this.filesToScan.length, filter: 0, files: {} };
    this.project.filesNotScanned = {};
    this.project.processedFiles = 0;
    this.project.filesSummary.include = this.filesToScan.length;
    this.project.metadata.setFileCounter(this.filesToScan.length);
    this.project.setTree(tree);
    this.project.save();
  }

}


