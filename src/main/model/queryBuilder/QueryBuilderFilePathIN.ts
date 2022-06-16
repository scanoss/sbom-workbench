import { QueryBuilder } from './QueryBuilder';

export class QueryBuilderFIlePathIN extends QueryBuilder {
  private value: any;

  constructor(value: any) {
    super();
    this.value = value as Array<string>;
  }

  public getSQL(entityMapper: Record<string, string>): string {
    return `f.path IN (${String(this.value)})`;
  }

  public getFilters(): any[] {
    return null;
  }
}
