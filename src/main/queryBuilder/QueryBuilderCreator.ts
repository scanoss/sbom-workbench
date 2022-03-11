import { QueryBuilder } from './QueryBuilder';
import { QueryBuilderAND } from './QueryBuilderAND';
import { QueryBuilderCompId } from './QueryBuilderCompId';
import { QueryBuilderCustom } from './QueryBuilderCustom';
import { QueryBuilderIN } from './QueryBuilderIN';
import { QueryBuilderSource } from './QueryBuilderSource';
import { QueryBuilderStatus } from './QueryBuilderStatus';
import { QueryBuilderUsage } from './QueryBuilderUsage';
import { QueryBuilderVersion } from './QueryBuilderVersion';

export class QueryBuilderCreator {
  public static create(params: Record<string, any>): QueryBuilder {
    let builder: QueryBuilderAND = null;
    if (params) {
      builder = new QueryBuilderAND();
      if (params.path) {
        builder.add(new QueryBuilderCustom('path', 'LIKE', `${params.path}%`));
      }
      if (params.source) {
        builder.add(new QueryBuilderSource(params.source));
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
        builder.add(new QueryBuilderVersion(params.version));
      }
      if (params.compid) {
        const queryBuilderIN = new QueryBuilderIN();
        queryBuilderIN.add(new QueryBuilderCompId(params.compid));
        return queryBuilderIN;
      }
    }
    return builder;
  }
}
