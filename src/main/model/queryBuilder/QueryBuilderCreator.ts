import { QueryBuilder } from './QueryBuilder';
import { QueryBuilderAND } from './QueryBuilderAND';
import { QueryBuilderCompId } from './QueryBuilderCompId';
import { QueryBuilderCustom } from './QueryBuilderCustom';
import { QueryBuilderIN } from './QueryBuilderIN';
import { QueryBuilderStatus } from './QueryBuilderStatus';
import { QueryBuilderUsage } from './QueryBuilderUsage';
import { QueryBuilderFileIdIn } from './QueryBuilderFilIdIN';
import { QueryBuilderFilename } from './QueryBuilderFilename';
import { QueryBuilderFIlePathIN } from './QueryBuilderFilePathIN';
import {QueryBuilderMD5FileIn} from "./QueryBuilderMD5FileIn";

export class QueryBuilderCreator {
  public static create(params: Record<string, any>): QueryBuilder {
    let builder: QueryBuilderAND = null;
    if (params) {
      builder = new QueryBuilderAND();
      if (params.path) {
        builder.add(new QueryBuilderCustom('path', 'LIKE', `${params.path}%`));
      }
      if (params.source) {
        builder.add(new QueryBuilderCustom('source', '=', `${params.source}`));
      }
      if (params.status) {
        builder.add(new QueryBuilderStatus(params.status));
      }
      if (params.usage) {
        builder.add(new QueryBuilderUsage(params.usage));
      }
      if (params.purl) {
        builder.add(new QueryBuilderCustom('purl', '=', params.purl));
      }
      if (params.version) {
        builder.add(new QueryBuilderCustom('version', '=', params.version));
      }
      if (params.compid) {
        const queryBuilderIN = new QueryBuilderIN();
        queryBuilderIN.add(new QueryBuilderCompId(params.compid));
        return queryBuilderIN;
      }
      if (params.id) {
        builder.add(new QueryBuilderCustom('id', '=', params.id));
      }
      if (params.fileId) {
        const queryBuilderIN = new QueryBuilderIN();
        queryBuilderIN.add(new QueryBuilderFileIdIn(params.fileId));
        return queryBuilderIN;
      }
      if (params.filename) {
        builder.add(new QueryBuilderFilename(params.filename));
      }
      if (params.paths) {
        const queryBuilderIN = new QueryBuilderIN();
        queryBuilderIN.add(new QueryBuilderFIlePathIN(params.paths));
        return queryBuilderIN;
      }
      if(params.md5){
        const queryBuilderMD5 = new QueryBuilderMD5FileIn(params.md5);
        builder.add(queryBuilderMD5);
      }
    }
    return builder;
  }
}
