import fs from "fs";
import { IndexTreeTask } from "./IndexTreeTask";
import Folder from "../../workspace/tree/Folder";
import {Tree} from "../../workspace/tree/Tree";

export class CodeIndexTreeTask  extends IndexTreeTask{

  public async run(params: void):Promise<boolean>{
    const files = this.getProjectFiles(this.project.getScanRoot(),this.project.getScanRoot());
    const tree = await this.buildTree(files);
    await this.setTreeSummary(tree);
    return true;
  }

  private getProjectFiles(dir : string, rootPath: string): Array<string> {
    let results: Array<string> = [];
    const dirEntries = fs
      .readdirSync(dir, { withFileTypes: true }) // Returns a list of files and folders
      .sort(this.dirFirstFileAfter)
      .filter((dirent: any) => !dirent.isSymbolicLink());
    for (const dirEntry of dirEntries) {
      const relativePath = `${dir}/${dirEntry.name}`.replace(rootPath, '');
      if (dirEntry.isDirectory()) {
        const f: Folder = new Folder(relativePath, dirEntry.name);
        const subTree = this.getProjectFiles(
          `${dir}/${dirEntry.name}`,
          rootPath
        );

        results = results.concat(subTree);
      } else results.push(relativePath);
    }
    return results;
  }

  // This is a sorter that will sort folders before files in alphabetical order.
  private dirFirstFileAfter(a: any, b: any): number {
    if (!a.isDirectory() && b.isDirectory()) return 1;
    if (a.isDirectory() && !b.isDirectory()) return -1;
    return 0;
  }

  public async buildTree(files: Array<string>): Promise<Tree> {
    const tree = new Tree(this.project.metadata.getName(),this.project.getMyPath(),this.project.metadata.getScanRoot());
    tree.build(files);
    tree.setFilter();
    return tree;
  }

  public async setTreeSummary(tree: Tree){
    tree.summarize();
    const summary = tree.getSummarize();
    this.project.filesToScan = summary.files;
    this.project.filesSummary = summary;
    this.project.filesNotScanned = {};
    this.project.processedFiles = 0;
    this.project.metadata.setFileCounter(summary.include);
    this.project.setTree(tree);
    this.project.save();
  }

}
