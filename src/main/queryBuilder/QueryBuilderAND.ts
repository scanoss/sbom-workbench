
import { IWorkbenchFilter } from '../../api/types';
import { QueryBuilder } from './QueryBuilder';
import { QueryBuilderPath } from './QueryBuilderPath';
import { QueryBuilderPurl } from './QueryBuilderPurl';
import { QueryBuilderSource } from './QueryBuilderSource';
import { QueryBuilderStatus } from './QueryBuilderStatus';
import { QueryBuilderUsage } from './QueryBuilderUsage';

export class QueryBuilderAND extends QueryBuilder {
  private builders: QueryBuilder[];

  constructor() {
    super();
    this.builders = [];
  }

  public getSQL(): string {
    const partialSQL = this.builders.map((e) => e.getSQL()).join(' AND ');
    return partialSQL;
  }

  public getFilters(): any[] {
    const filters = [];
    this.builders.forEach((e) => {
      if (e.getFilters() != null) {
        filters.push(e.getFilters()[0]);
      }
    });
    return filters;
  }

  public addBuilder(builder: QueryBuilder) {
    this.builders.push(builder);
  }

  public create(params: IWorkbenchFilter) {
    if (params.path) {
      this.builders.push(new QueryBuilderPath(params.path));
    }
    if (params.source) {
      this.builders.push(new QueryBuilderSource(params.source));
    }
    if (params.status) {
      this.builders.push(new QueryBuilderStatus(params.status));
    }
    if (params.usage) {
      this.builders.push(new QueryBuilderUsage(params.usage));
    }
    if (params.purl) {
      this.builders.push(new QueryBuilderPurl(params.purl));
    }
  }
}
