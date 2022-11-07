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
  public abstract buildTree(files: Array<string>):Promise<Tree>;

  public getStageProperties(): Scanner.StageProperties {
    return {
      name: ScannerStage.INDEX,
      label: 'Indexing',
      isCritical: true,
    };
  }

  public abstract setTreeSummary(tree: Tree);



}
