import { QueryBuilder } from './QueryBuilder';

export class QueryBuilderUsage extends QueryBuilder {

  private value: string;

  constructor(value: string) {
    super();
    this.value = value;
  }


  public getSQL(): string {
    return `f.usage=?`;
  }

  public getFilters(): any[]{
    return [this.value];
  } 
}
