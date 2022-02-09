import { QueryBuilder } from "./QueryBuilder";


export class QueryBuilderSource extends QueryBuilder {
  private value: string;

  constructor(value: string) {
    super();
    this.value = value;
  }

  public getSQL(): string {
    return `comp.source=?`;
  }

  public getFilters(): string[] {
    return [this.value];
  }
}
