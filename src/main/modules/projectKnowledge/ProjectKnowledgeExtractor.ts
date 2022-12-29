import {ExtractFromProjectDTO, FileStatusType, InventoryKnowledgeExtraction} from "../../../api/types";
import {ProjectKnowledgeModel} from "../../model/ProjectKnowledgeModel";
import {inventoryToInventoryKnowledgeExtraction} from "./projectKnowledgeAdapters/projectKnowledgeAdapter";
import {QueryBuilderCreator} from "../../model/queryBuilder/QueryBuilderCreator";
import {modelProvider} from "../../services/ModelProvider";
import {workspace} from "../../workspace/Workspace";


export class ProjectKnowledgeExtractor {
  private readonly projectKnowledgeExtractor: ExtractFromProjectDTO

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
  public async extractInventoryData():Promise<InventoryKnowledgeExtraction> {
      const model = new ProjectKnowledgeModel(`${this.projectKnowledgeExtractor.target.work_root}/scan_db`);
      const projectInventories = [];
      const filesToProcess = await this.getFilesToProcess();
      for(let i = 0 ; i< this.projectKnowledgeExtractor.source.length ; i +=1) {
        const project = {
          projectName: this.projectKnowledgeExtractor.source[i].name,
          inventories:[],
        };
       const inventories = await model.extractProjectInventoryData(`${this.projectKnowledgeExtractor.source[i].work_root}/scan_db`,filesToProcess,this.projectKnowledgeExtractor.md5File);
        project.inventories = inventories;
       projectInventories.push(project);
      }
    return inventoryToInventoryKnowledgeExtraction(projectInventories);
  }

  /**
   * @brief files in the target project on which the extraction should be done
   * @return array of files that accomplish with the filters
   * */
  private async getFilesToProcess(): Promise<Array<string>> {
    const globalFilter = workspace.getOpenProject().getGlobalFilter();
    let filesToProcess = await modelProvider.model.result.getAll(QueryBuilderCreator.create({
      ...globalFilter,
      path: this.projectKnowledgeExtractor.folder,
      status: this.projectKnowledgeExtractor.override ? globalFilter?.status : FileStatusType.PENDING,
    }));
    filesToProcess = filesToProcess.map((f) => f.path);
    return filesToProcess;
  }

}
