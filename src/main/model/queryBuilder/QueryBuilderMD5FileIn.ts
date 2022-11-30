import { QueryBuilder } from './QueryBuilder';

export class QueryBuilderMD5FileIn extends QueryBuilder {
  private value: any;

  constructor(value: any) {
    super();
    this.value = value as Array<string>;
  }

  public getSQL(entityMapper: Record<string, string>): string {
    const md5Files =  this.value.map(function(file) { return `'${  file  }'`; }).join(", ");
    return `r.md5_file IN (${md5Files})`;
  }

  public getFilters(): any[] {
    return null;
  }
}
