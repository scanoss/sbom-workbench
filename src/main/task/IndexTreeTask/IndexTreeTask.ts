import fs from "fs";
import { Project } from '../../workspace/Project';
import { Scanner } from '../scanner/types';
import { ScannerStage } from '../../../api/types';
import {Tree} from "../../workspace/tree/Tree";
import Folder from "../../workspace/tree/Folder";

export abstract class IndexTreeTask implements Scanner.IPipelineTask {
  protected project: Project;

  constructor(project: Project) {
    this.project = project;
  }

  public abstract run(): Promise<boolean>;
  public abstract buildTree(files: Array<string>);

  public getStageProperties(): Scanner.StageProperties {
    return {
      name: ScannerStage.INDEX,
      label: 'Indexing',
      isCritical: true,
    };
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
