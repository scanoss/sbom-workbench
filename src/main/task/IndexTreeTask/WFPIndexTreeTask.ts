import fs from "fs";
import { IndexTreeTask } from "./IndexTreeTask";
import {Tree} from "../../workspace/tree/Tree";

export class WFPIndexTreeTask extends IndexTreeTask {

  public async run(): Promise<boolean> {
    const files = this.getFiles();
    await this.buildTree(files);
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
    const wfp = fs.readFileSync(this.project.getScanRoot(),
      {encoding:'utf8'});
    return wfp;
  }

  public async buildTree(files: Array<string>){
    const tree = new Tree(this.project.metadata.getScanRoot(),this.project.getMyPath());
    tree.build(files);
    await this.setTreeSummary(tree);
  }

}


