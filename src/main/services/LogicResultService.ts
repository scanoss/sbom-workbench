import { NodeStatus } from '../workspace/Tree/Tree/Node';
import { workspace } from '../workspace/Workspace';

class LogicResultService {
  public async getResultsByids(ids: number[], project: any) {
    try {
      const results: Array<any> = await project.scans_db.results.getSummaryByids(ids);
      const response = {};
      results.forEach((element: any) => {
        if (response[element.path] === undefined) {
          response[element.path] =
            element.identified === 1 ? 'identified' : element.ignored === 1 ? 'ignored' : 'pending';
        }
      });

      return response;
    } catch (e) {
      return e;
    }
  }

  public async getFilesInFolder(folder: string) {
    try {
      const project = workspace.getOpenedProjects()[0];
      const results: Array<any> = await project.scans_db.results.getFilesInFolder(folder);
      return results;
    } catch (e) {
      return e;
    }
  }

  public async getResultsFromIDs(ids: number[]) {
    try {
      const project = workspace.getOpenedProjects()[0];
      const results: Array<any> = await project.scans_db.results.getSummaryByids(ids);
      return results;
    } catch (e) {
      return e;
    }
  }

  public async ignore(ids: number[]) {
    try {
      const project = workspace.getOpenedProjects()[0];
      const success = await project.scans_db.files.ignored(ids);
      return success;
    } catch (e) {
      return e;
    }
  }

  public async identified(ids: number[]) {
    try {
      const project = workspace.getOpenedProjects()[0];
      const success = await project.scans_db.results.identified(ids);
      return success;
    } catch (e) {
      return e;
    }
  }

  public async getFromPath(path: string) {
    try {
      const project = workspace.getOpenedProjects()[0];
      const results = await project.scans_db.results.getFromPath(path);
      const components: any = await project.scans_db.components.allComp();
      results.forEach((result) => {
        if (result.license) result.license = result.license.split(',');
        if (result.version)
          result.component = components.find(
            (component) => component.purl === result.purl && component.version === result.version
          );
        else result.component = null;
      });
      return results;
    } catch (error: any) {
      return error;
    }
  }
}
export const logicResultService = new LogicResultService();
