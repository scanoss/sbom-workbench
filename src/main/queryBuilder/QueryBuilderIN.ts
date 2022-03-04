import { QueryBuilder } from './QueryBuilder';

export class QueryBuilderIN extends QueryBuilder {
  private builders: QueryBuilder[];

  constructor() {
    super();
    this.builders = [];
  }

  public getSQL(): string {
    const partialSQL = this.builders.map((e) => e.getSQL());
    return partialSQL[0];
  }

  public getFilters(): any[] {
    return this.builders[0].getFilters();
  }

  public add(queryBuilder: QueryBuilder): void {
    this.builders.push(queryBuilder);
  }
}
