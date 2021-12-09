import { Filter } from './Filter';

export class FilterNOT extends Filter {
  private filter: Filter;

  constructor(filter: Filter) {
    super();
    this.filter = filter;
  }

  public isValid(data: any): boolean {
    return !this.filter.isValid(data);
  }
}
