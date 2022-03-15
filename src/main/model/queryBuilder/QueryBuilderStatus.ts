import { FileStatusType } from '../../../api/types';
import { QueryBuilder } from './QueryBuilder';

export class QueryBuilderStatus extends QueryBuilder {
  private value: FileStatusType;

  constructor(value: FileStatusType) {
    super();
    this.value = value;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public getSQL(_queryAdapter: Record<string, string>): string {
    if (this.value === FileStatusType.IDENTIFIED) return 'f.identified=1';
    if (this.value === FileStatusType.ORIGINAL) return 'f.ignored=1';
    if (this.value === FileStatusType.NOMATCH) return `type='NO-MATCH' AND f.ignored=0 AND f.identified=0`;
    if (this.value === FileStatusType.FILTERED) return `type='FILTERED' AND f.ignored=0 AND f.identified=0`;
    return `f.identified=0 AND f.ignored=0 AND type='MATCH'`;
  }

  public getFilters(): any[] {
    return null;
  }
}
