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

  public async getResultsRescan() {
    const project = workspace.getOpenedProjects()[0];
    const results: Array<any> = await project.scans_db.results.getResultsRescan();

    results.forEach((result) => {
      if (result.idtype === 'none' && result.identified === 1) {
        result[result.path] = NodeStatus.IDENTIFIED;
        result.status = NodeStatus.IDENTIFIED;
        result.original = NodeStatus.NOMATCH;
      } else if (result.idtype === 'none') {
        result[result.path] = NodeStatus.NOMATCH;
        result.status = NodeStatus.NOMATCH;
        result.original = NodeStatus.NOMATCH;
      } else if (result.identified === 1) {
        result[result.path] = NodeStatus.IDENTIFIED;
        result.status = NodeStatus.IDENTIFIED;
        result.original = NodeStatus.MATCH;
      } else if (result.ignored === 1) {
        result[result.path] = NodeStatus.IGNORED;
        result.status = NodeStatus.IGNORED;
        result.original = NodeStatus.MATCH;
      } else if (result.pending === 1) {
        result[result.path] = NodeStatus.PENDING;
        result.status = NodeStatus.PENDING;
        result.original = NodeStatus.MATCH;
      }
    });

    return results;
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
}
export const logicResultService = new LogicResultService();
