import { InventoryAction } from '../../api/types';
import { logicResultService } from '../services/LogicResultService';
import { Filter } from './Filter/Filter';

export abstract class Bach {
  private filesInFolder: any;

  private filesToProcess: Array<any>;

  private results: Array<string>;

  private overWrite: boolean;

  private folder: string;

  constructor(folder: string, params: boolean) {
    this.overWrite = params;
    this.folder = folder;
  }

  public getFolder(): string {
    return this.folder;
  }

  private async getFilesInFolder(folder: string): Promise<Array<any>> {
    const files: any = await logicResultService.getFilesInFolder(folder);
    return files;
  }

  public async getFilesToProcess(folder: string, value: any, filter: Filter): Promise<Array<any>> {
    const aux = await this.getFilesInFolder(folder);
    return this.getArrayFromObject(aux, value, filter);
  }

  public async getResults(ids: Array<number>): Promise<Array<any>> {
    const results: any = await logicResultService.getResultsFromIDs(ids);
    return results;
  }

  public getArrayFromObject(results: any[], value: any, filter: Filter): Array<any> {
    const array = [];
    results.forEach((result) => {
      if (filter.isValid(result)) {
        array.push(result[value]);
      }
    });
    return array;
  }

  public getOverWrite(): boolean {
    return this.overWrite;
  }

  public abstract excecute();
}
