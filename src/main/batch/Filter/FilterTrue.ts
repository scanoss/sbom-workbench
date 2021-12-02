import { Filter } from "./Filter";

export class FilterTrue extends Filter {
  isValid(data: any): boolean {
    return true;
  }
}
