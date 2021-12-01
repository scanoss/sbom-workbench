import { Filter } from "./Filter";

export class FilterAND extends Filter {
  private Filter1: Filter;

  private Filter2: Filter;

  constructor(Filter1: Filter, Filter2: Filter) {
    super();
    this.Filter1 = Filter1;
    this.Filter2 = Filter2;
  }

  public isValid(data: any): boolean {
    return this.Filter1.isValid(data) && this.Filter2.isValid(data);
  }
}
