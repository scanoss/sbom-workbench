import { QueryBuilder } from './QueryBuilder';
import { QueryBuilderAND } from './QueryBuilderAND';
import { QueryBuilderPath } from './QueryBuilderPath';
import { QueryBuilderPurl } from './QueryBuilderPurl';
import { QueryBuilderSource } from './QueryBuilderSource';
import { QueryBuilderStatus } from './QueryBuilderStatus';
import { QueryBuilderUsage } from './QueryBuilderUsage';

export class QueryBuilderCreator {
  public static create(params: Record<string, any>): QueryBuilder {
    let builder: QueryBuilderAND = null;
    if (params) {
      builder = new QueryBuilderAND();
      if (params.path) {
        builder.add(new QueryBuilderPath(params.path));
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
        builder.add(new QueryBuilderPurl(params.purl));
      }
    }

    return builder;
  }
}
