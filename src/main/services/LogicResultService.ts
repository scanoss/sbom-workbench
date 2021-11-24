import { NodeStatus } from '../workspace/Tree/Tree/Node';
import { workspace } from '../workspace/Workspace';

class LogicResultService {
  public async getResultsByids(ids: number[]) {
    try {
      const project = workspace.getOpenedProjects()[0];
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
      if (result.identified === 1) {
        result[result.path] = NodeStatus.IDENTIFIED;
        result.status = NodeStatus.IDENTIFIED;
      } else if (result.ignored === 1) {
        result[result.path] = NodeStatus.IGNORED;
        result.status = NodeStatus.IGNORED;
      } else {
        result[result.path] = NodeStatus.PENDING;
        result.status = NodeStatus.PENDING;
      }
    });

    return results;
  }
}
export const logicResultService = new LogicResultService();
