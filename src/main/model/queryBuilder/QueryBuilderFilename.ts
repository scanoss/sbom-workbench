import { QueryBuilder } from './QueryBuilder';

export class QueryBuilderFilename extends QueryBuilder {
  private filename: string;

  constructor(filename: string) {
    super();
    this.filename = filename;
  }

  public getSQL(entityMapper: Record<string, string>): string {
    return `${entityMapper.path} LIKE ?`;
  }

  public getFilters(): any[] {
    const term = `%${this.filename.replaceAll('*', '%')}%`;
    return [term];
  }
}
