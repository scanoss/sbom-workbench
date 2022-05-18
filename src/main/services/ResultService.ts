import { QueryBuilder } from '../model/queryBuilder/QueryBuilder';
import { QueryBuilderCreator } from '../model/queryBuilder/QueryBuilderCreator';
import { modelProvider } from './ModelProvider';
import {IInsertResult} from "../model/interfaces/IInsertResult";

class ResultService {
  public async getResultsByids(ids: number[], project: any) {
    try {
      const results: Array<any> = await project.store.results.getSummaryByids(ids);
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

  public async getFilesInFolder(builder: QueryBuilder) {
    try {
      const results: Array<any> = await modelProvider.model.result.getAll(builder);
      return results;
    } catch (e) {
      return e;
    }
  }

  public async getResultsFromIDs(ids: number[]) {
    try {
      const results: Array<any> = await modelProvider.model.result.getSummaryByids(ids);
      return results;
    } catch (e) {
      return e;
    }
  }


  public async getFromPath(path: string) {
    try {
      const results = await modelProvider.model.result.getFromPath(path);
      const queryBuilder = QueryBuilderCreator.create({ path });
      const components: any = await modelProvider.model.component.getAll(queryBuilder);
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

  public async insertFromFile(resultPath: string, files: any) {
    const resultLicenses:IInsertResult = await modelProvider.model.result.insertFromFile(resultPath, files);
    await modelProvider.model.result.insertResultLicense(resultLicenses);
  }
}
export const resultService = new ResultService();
