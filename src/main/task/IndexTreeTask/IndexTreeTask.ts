import i18next from 'i18next';
import { Project } from '../../workspace/Project';
import { Scanner } from '../scanner/types';
import { ScannerStage } from '../../../api/types';
import { Tree } from "../../workspace/tree/Tree";
import path from 'path';
import fs from 'fs';
import { parser } from 'stream-json';
import { streamObject } from 'stream-json/streamers/StreamObject';
import log from 'electron-log';


export abstract class IndexTreeTask implements Scanner.IPipelineTask {
  protected project: Project;

  constructor(project: Project) {
    this.project = project;
  }

  public abstract run(): Promise<boolean>;

  public getStageProperties(): Scanner.StageProperties {
    return {
      name: ScannerStage.INDEX,
      label: i18next.t('Title:Indexing'),
      isCritical: true,
    };
  }

  public abstract setTreeSummary(tree: Tree);



}
