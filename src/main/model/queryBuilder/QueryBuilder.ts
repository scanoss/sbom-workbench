export abstract class QueryBuilder {
  public abstract getSQL(entityMapper?: Record<string, string>): string;

  public abstract getFilters(): any[];
}
