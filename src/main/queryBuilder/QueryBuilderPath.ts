import { QueryBuilder } from './QueryBuilder';

export class QueryBuilderPath extends QueryBuilder {
  private value: string;

  constructor(value: string) {
    super();
    this.value = value;
  }

  public getSQL(): string {
    return `f.path LIKE ?`;
  }

  public getFilters(): any[] {
    return [`${this.value}%`];
  }
}
