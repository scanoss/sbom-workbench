import { Filter } from './Filter';

export class FilterOR extends Filter {
  private filter1: Filter;

  private filter2: Filter;

  constructor(filter1: Filter, filter2: Filter) {
    super();
    this.filter1 = filter1;
    this.filter2 = filter2;
  }

  public isValid(data: any): boolean {
    if (this.filter1.isValid(data) || this.filter2.isValid(data)) {
      return true;
    }

    return false;
  }
}
