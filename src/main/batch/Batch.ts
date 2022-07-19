import { IBatchInventory, InventorySourceType } from '../../api/types';
import { utilHelper } from '../helpers/UtilHelper';
import { QueryBuilder } from '../model/queryBuilder/QueryBuilder';
import { resultService } from '../services/ResultService';
import { treeService } from '../services/TreeService';
import { NodeStatus } from '../workspace/tree/Node';
import { Filter } from './Filter/Filter';
import { modelProvider } from '../services/ModelProvider';
import { QueryBuilderFileIdIn } from '../model/queryBuilder/QueryBuilderFilIdIN';

export abstract class Batch {
  private overWrite: boolean;

  private folder: string;

  private params: IBatchInventory;

  constructor(params: IBatchInventory) {
    this.overWrite = params.overwrite;
    this.folder = params.source.type === InventorySourceType.PATH ? params.source.input : null;
    this.params = params;
  }

  public getFolder(): string {
    return this.folder;
  }

  public getParams(): IBatchInventory {
    return this.params;
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
      if (this.params.source.type === InventorySourceType.PATH) {
        const aux = await this.getFilesInFolder(builder);
        if (filter) return utilHelper.getArrayFromObjectFilter(aux, value, filter);
        return utilHelper.getArrayFromObject(aux, value);
      }
      const files = await modelProvider.model.file.getAll(new QueryBuilderFileIdIn(this.params.source.input)); // TODO:FIXME: repeated files in getAll files
      // If not Overwrite, keep ignored and identified files
      const result = files.filter((f) => this.overWrite || (!f.ignored && !f.identified)).map((f) => f.id);
      return [...new Set(result)];
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
