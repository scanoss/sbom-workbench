import { QueryBuilder } from './QueryBuilder';

export class QueryBuilderCompId extends QueryBuilder {
  private value: any;

  constructor(value: any) {
    super();
    this.value = value;
  }

  public getSQL(entityMapper: Record<string, string>): string {
    return `comp.id IN (${this.value.toString()})`;
  }

  public getFilters(): any[] {
    return null;
  }
}
