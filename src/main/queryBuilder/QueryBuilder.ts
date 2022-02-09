
export abstract class QueryBuilder {
  public abstract getSQL(): string;

  public abstract getFilters(): any[];

  
}
