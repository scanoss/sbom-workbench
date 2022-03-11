import { QueryBuilder } from './QueryBuilder';

export class QueryBuilderUsage extends QueryBuilder {
  private value: string;

  constructor(value: string) {
    super();
    this.value = value;
  }

  public getSQL(entityMapper: Record<string, string>): string {
    return `r.idtype=?`;
  }

  public getFilters(): any[]{
    return [this.value];
  } 
}
