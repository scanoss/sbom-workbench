import { utilHelper } from '../helpers/UtilHelper';
import { QueryBuilder } from '../model/queryBuilder/QueryBuilder';
import { resultService } from '../services/ResultService';
import { treeService } from '../services/TreeService';
import { NodeStatus } from '../workspace/tree/Node';
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

  public async getFilesInFolder(builder: QueryBuilder): Promise<Array<any>> {
    try {
      const files: any = await resultService.getFilesInFolder(builder);
      return files;
    } catch (e: any) {
      throw new Error(e);
    }
  }

  public async getFilesToProcess(builder: QueryBuilder, value: any, filter?: Filter): Promise<Array<any>> {
    try {
      const aux = await this.getFilesInFolder(builder);
      if (filter) return utilHelper.getArrayFromObjectFilter(aux, value, filter);
      return utilHelper.getArrayFromObject(aux, value);
    } catch (e: any) {
      return e;
    }
  }

  public async getResults(ids: Array<number>): Promise<Array<any>> {
    const results: any = await resultService.getResultsFromIDs(ids);
    return results;
  }

  public getOverWrite(): boolean {
    return this.overWrite;
  }

public async updateTree(fileIds: Array<number>, status: NodeStatus): Promise<void> {
   await treeService.updateTree(fileIds, status);
}

  public abstract execute();
}
