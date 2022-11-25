import { IProject, InventoryKnowledgeExtraction } from "../../../api/types";
import {ProjectKnowledgeModel} from "../../model/ProjectKnowledgeModel";
import { inventoryToInventoryKnowledgeExtraction } from "./projectKnowledgeAdapters/projectKnowledgeAdapter";


export class ProjectKnowledgeExtractor {
  private readonly projects: Array<IProject>

  /**
  *@param projects projects were the data will be extracted
  */
  constructor(projects: Array<IProject>) {
    this.projects = projects;
  }

  /**
  * @brief extracts the inventory data from external projects
  * @param source the project source path
  * @return InventoryKnowledgeExtraction
  * */
  public async extractInventoryData(sourceProject: IProject):Promise<InventoryKnowledgeExtraction> {
      const model = new ProjectKnowledgeModel(`${sourceProject.work_root}/scan_db`);
      const projectInventories = [];
      for(let i = 0 ; i< this.projects.length ; i +=1) {
        const project = {
          projectName: this.projects[i].name,
          inventories:[],
        };
       const inventories = await model.extractProjectInventoryData(`${this.projects[i].work_root}/scan_db`);
        project.inventories = inventories;
       projectInventories.push(project);
      }
    return inventoryToInventoryKnowledgeExtraction(projectInventories);
  }

  public async extractInventoryDataFile(sourceProject: IProject, file:string) {
    const model = new ProjectKnowledgeModel(`${sourceProject.work_root}/scan_db`);
    const projectInventories = [];
    for(let i = 0 ; i< this.projects.length ; i +=1) {
      const project = {
        projectName: this.projects[i].name,
        inventories:[],
      };
      const inventories = await model.extractProjectInventoryDataFile(`${this.projects[i].work_root}/scan_db`, file);
      project.inventories = inventories;
      projectInventories.push(project);
    }
    return inventoryToInventoryKnowledgeExtraction(projectInventories);
  }

}
