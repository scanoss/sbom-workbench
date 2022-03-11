import { QueryBuilder } from './QueryBuilder';

// TODO: REMOVE THIS CLASS WHEN CUSTOM QUERY BUILDER IS IMPLEMENTED
export class QueryBuilderVersion extends QueryBuilder {
  private value: string;

  constructor(value: string) {
    super();
    this.value = value;
  }

  public getSQL(): string {
    return `comp.version = ?`;
  }

  public getFilters(): any[] {
    return [this.value];
  }
}
