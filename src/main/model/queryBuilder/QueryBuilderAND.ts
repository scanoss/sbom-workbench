import { QueryBuilder } from './QueryBuilder';

export class QueryBuilderAND extends QueryBuilder {
  private builders: QueryBuilder[];

  constructor() {
    super();
    this.builders = [];
  }

  public getSQL(entityMapper: Record<string, string>): string {
    const partialSQL = this.builders
      .map((e) => e.getSQL(entityMapper))
      .join(' AND ');
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

  public add(builder: QueryBuilder) {
    this.builders.push(builder);
  }
}
