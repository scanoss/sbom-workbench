import { InventoryAction } from '../../api/types';
import { logicResultService } from '../services/LogicResultService';

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

  public async getFilesToProcess(folder: string, value: any, condition?: any, condition2?: any): Promise<Array<any>> {
    const aux = await this.getFilesInFolder(folder);
    return this.getArrayFromObject(aux, value, condition, condition2);
  }

  public async getResults(ids: Array<number>): Promise<Array<any>> {
    const results: any = await logicResultService.getResultsFromIDs(ids);
    return results;
  }

  public getArrayFromObject(results: any[], value: any, condition?: any, condition2?: any): Array<any> {
    const array = [];
    results.forEach((result) => {
      if (condition && condition2) {
        if (result[condition]) array.push(result[value]);
        if (result[condition2]) array.push(result[value]);
      } else if (condition) {
        if (result[condition]) array.push(result[value]);
      } else {
        array.push(result[value]);
      }
    });
    return array;
  }

  public abstract excecute();
}
