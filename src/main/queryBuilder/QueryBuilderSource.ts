import { QueryBuilder } from "./QueryBuilder";

// TO DO: DO IT FOR HER
export class QueryBuilderSource extends QueryBuilder {
  private value: string;

  constructor(value: string) {
    super();
    this.value = value;
  }

  public getSQL(entityMapper: Record<string, string>): string { 
    return `comp.source=?`;
  }

  public getFilters(): string[] {
    return [this.value];
  }
}
