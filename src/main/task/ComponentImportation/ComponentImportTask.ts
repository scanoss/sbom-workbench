import { Project } from 'main/workspace/Project';
import { Scanner } from '../scanner/types';
import { fileService } from '../../services/FileService';
import { fileHelper } from '../../helpers/FileHelper';
import { resultService } from '../../services/ResultService';
import { componentService } from '../../services/ComponentService';
import { ScannerStage, ScanState } from '../../../api/types';
import fs from 'fs';
import path from 'path';

export class ComponentImportTask implements Scanner.IPipelineTask{

  private project: Project;

  constructor(project: Project) {
    this.project = project;
  }

  getStageProperties(): Scanner.StageProperties {
    return {
      name: ScannerStage.IMPORT_COMPONENT,
      label: 'Importing components',
      isCritical: true,
    };
  }

  public async run(): Promise<boolean> {
    const resultPath = path.join(this.project.getMyPath(), 'result.json');
    const results = await fs.promises.readFile(resultPath, 'utf-8');
    const parsedResults = JSON.parse(results);
    this.project.tree.attachResults(parsedResults);
    await fileService.insert(this.project.getTree().getRootFolder().getFiles());
    const files = await fileHelper.getPathFileId();
    await resultService.insertFromFile(resultPath, files);
    await componentService.importComponents();
    this.project.metadata.setScannerState(ScanState.FINISHED);
    this.project.getTree().updateFlags();
    this.project.metadata.save();
    this.project.save()
    return true
  }

}

