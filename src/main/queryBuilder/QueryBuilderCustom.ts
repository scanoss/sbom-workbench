import { QueryBuilder } from './QueryBuilder';

export class QueryBuilderCustom extends QueryBuilder {
  private value: string;

  private operator: string;

  private key: string;

  constructor(key: string, operator: string, value: string) {
    super();
    this.value = value;
    this.operator = operator;
    this.key = key;
  }

  public getSQL(entityMapper: Record<string, string>): string {
    return `${entityMapper[this.key]} ${this.operator} ?`;
  }

  public getFilters(): any[] {
    return [this.value];
  }
}
