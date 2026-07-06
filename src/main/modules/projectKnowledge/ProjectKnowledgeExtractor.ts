import path from 'path';
import { ExtractFromProjectDTO, FileStatusType, ProjectKnowledgeExtractionResult } from '../../../api/types';
import { ProjectKnowledgeModel } from '../../model/project/models/ProjectKnowledgeModel';
import { dependencyToDependencyKnowledgeExtraction, inventoryToInventoryKnowledgeExtraction } from './projectKnowledgeAdapters/projectKnowledgeAdapter';
import { QueryBuilderCreator } from '../../model/queryBuilder/QueryBuilderCreator';
import { modelProvider } from '../../services/ModelProvider';
import { workspace } from '../../workspace/Workspace';

export class ProjectKnowledgeExtractor {
  private readonly projectKnowledgeExtractor: ExtractFromProjectDTO;

  /**
  *@param ExtractFromProjectDTO Interface which contains all the data to extract the knowledge data from external projects
  */
  constructor(params: ExtractFromProjectDTO) {
    this.projectKnowledgeExtractor = params;
  }

  /**
  * @brief extracts the inventory data from external projects
  * @return InventoryKnowledgeExtraction
  * */
  public async extractInventoryData():Promise<ProjectKnowledgeExtractionResult> {
    const model = new ProjectKnowledgeModel(path.join(workspace.getMyPath(), this.projectKnowledgeExtractor.target.work_root, 'scan_db'));
    const projectInventories = [];
    const projectDependencies = [];
    const filesToProcess = await this.getFilesToProcess();
    for (let i = 0; i < this.projectKnowledgeExtractor.source.length; i += 1) {
      const sourceScanDb = path.join(workspace.getMyPath(), this.projectKnowledgeExtractor.source[i].work_root, 'scan_db');
      const inventories: any = await model.extractProjectInventoryData(sourceScanDb, filesToProcess, this.projectKnowledgeExtractor.md5File);
      projectInventories.push({ projectName: this.projectKnowledgeExtractor.source[i].name, inventories });
      if (this.projectKnowledgeExtractor.includeDependencies) {
        const dependencies: any = await model.extractProjectDependencyData(sourceScanDb, this.projectKnowledgeExtractor.folder);
        projectDependencies.push({ projectName: this.projectKnowledgeExtractor.source[i].name, dependencies });
      }
    }
    return {
      inventories: inventoryToInventoryKnowledgeExtraction(projectInventories),
      dependencies: this.projectKnowledgeExtractor.includeDependencies ? dependencyToDependencyKnowledgeExtraction(projectDependencies) : {},
    };
  }

  /**
   * @brief files in the target project on which the extraction should be done
   * @return array of files that accomplish with the filters
   * */
  private async getFilesToProcess(): Promise<Array<string>> {
    const globalFilter = workspace.getOpenProject().getGlobalFilter();

    let filesToProcess = !this.projectKnowledgeExtractor.override && (globalFilter?.status === FileStatusType.IDENTIFIED || globalFilter?.status === FileStatusType.ORIGINAL)
      ? []
      : await modelProvider.model.result.getAll(QueryBuilderCreator.create({
        ...globalFilter,
        path: this.projectKnowledgeExtractor.folder,
        status: this.projectKnowledgeExtractor.override ? globalFilter?.status : FileStatusType.PENDING,
      }));

    filesToProcess = filesToProcess.map((f) => f.path);
    return filesToProcess;
  }
}
