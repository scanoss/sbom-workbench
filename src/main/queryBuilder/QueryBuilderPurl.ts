import { QueryBuilder } from './QueryBuilder';

export class QueryBuilderPurl extends QueryBuilder {
  private value: string;

  constructor(value: string) {
    super();
    this.value = value;
  }

  public getSQL(): string {
    return `r.purl=?`;
  }

  public getFilters(): any[] {
    return [this.value];
  }
}
