import { QueryBuilder } from './QueryBuilder';

export class QueryBuilderFileIdIn extends QueryBuilder {
  private value: any;

  constructor(value: any) {
    super();
    this.value = value;
  }

  public getSQL(entityMapper: Record<string, string>): string {
    return `fi.fileId IN (${this.value.toString()})`;
  }

  public getFilters(): any[] {
    return null;
  }
}
