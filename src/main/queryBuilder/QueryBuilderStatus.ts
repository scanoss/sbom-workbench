import { FileStatusType } from '../../api/types';
import { QueryBuilder } from './QueryBuilder';

export class QueryBuilderStatus extends QueryBuilder {
  private value: FileStatusType;

  constructor(value: FileStatusType) {
    super();
    this.value = value;
  }

  public getSQL(): string {
    if (this.value === FileStatusType.IDENTIFIED) return 'f.identified=1';
    if (this.value === FileStatusType.ORIGINAL) return 'f.ignored=1';
    return 'f.identified=0 AND f.ignored=0';
  }

  public getFilters(): any[] {
    return null;
  }
}
