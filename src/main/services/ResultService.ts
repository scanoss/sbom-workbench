import { QueryBuilder } from '../model/queryBuilder/QueryBuilder';
import { QueryBuilderCreator } from '../model/queryBuilder/QueryBuilderCreator';
import { modelProvider } from './ModelProvider';
import { ResultAdapter } from '../adapters/ResultAdapter';

class ResultService {
  public async getResultsByids(ids: number[], project: any) {
    const results: Array<any> = await project.store.results.getSummaryByids(ids);
    const response = {};
    results.forEach((element: any) => {
      if (response[element.path] === undefined) {
        response[element.path] = element.identified === 1 ? 'identified' : element.ignored === 1 ? 'ignored' : 'pending';
      }
    });
    return response;
  }

  public async getFilesInFolder(builder: QueryBuilder) {
    const results: Array<any> = await modelProvider.model.result.getAll(builder);
    return results;
  }

  public async getResultsFromIDs(ids: number[]) {
    const results = await modelProvider.model.result.getSummaryByids(ids);
    return results;
  }

  public async getFromPath(path: string) {
    let results = await modelProvider.model.result.getFromPath(path);
    results = new ResultAdapter().adapt(results);
    const queryBuilder = QueryBuilderCreator.create({ filePath: path });
    const components: any = await modelProvider.model.component.getAll(queryBuilder);
    results.forEach((result) => {
      if (result.version) result.component = components.find((component) => component.purl === result.purl && component.version === result.version);
      else result.component = null;
    });
    return results;
  }

  public async  insertFromFile(resultPath: string, files: any) {
    await modelProvider.model.result.insertFromFile(resultPath, files);
  }
}
export const resultService = new ResultService();
