
import { utilHelper } from '../helpers/UtilHelper';
import { logicResultService } from '../services/LogicResultService';
import { logictTreeService } from '../services/LogicTreeService';
import { NodeStatus } from '../workspace/Tree/Tree/Node';
import { Filter } from './Filter/Filter';
import { FilterTrue } from './Filter/FilterTrue';

export abstract class Batch {
  private overWrite: boolean;

  private folder: string;

  constructor(folder: string, params: boolean) {
    this.overWrite = params;
    this.folder = folder;
  }

  public getFolder(): string {
    return this.folder;
  }

  public async getFilesInFolder(folder: string): Promise<Array<any>> {
    try {
      const files: any = await logicResultService.getFilesInFolder(folder);
      return files;
    } catch (e: any) {
      throw new Error(e);
    }
  }

  public async getFilesToProcess(folder: string, value: any, filter: Filter): Promise<Array<any>> {
    try {  
      const aux = await this.getFilesInFolder(folder);
      return utilHelper.getArrayFromObjectFilter(aux, value, filter);
    } catch (e: any) {
      return e;
    }
  }

  public async getResults(ids: Array<number>): Promise<Array<any>> {
    const results: any = await logicResultService.getResultsFromIDs(ids);
    return results;
  }

  public getOverWrite(): boolean {
    return this.overWrite;
  }

  public async updateTree(ids: Array<number>, status: NodeStatus): Promise<boolean> {
    return this.getResults(ids)
      .then((results) => {
        const paths = utilHelper.getArrayFromObjectFilter(results, 'path', new FilterTrue()) as Array<string>;
        logictTreeService.updateStatus(paths, status);
        return true;
      })
      .catch((error) => {
        throw error;
      });
  }

  public abstract execute();
}
