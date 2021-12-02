import { Filter } from '../batch/Filter/Filter';

class UtilHelper {
  public getArrayFromObjectValue(files, attribute: any): Array<string> {
    const result: Array<string> = [];
    files.forEach((element) => {
      result.push(element[attribute]);
    });
    return result;
  }

  public convertsArrayOfStringToString(path: Array<string>): string {
    let out = '(';
    for (const file of path) out += `"${file}",`;
    out = out.slice(0, -1);
    out += ')';
    return out;
  }

  public getArrayFromObjectFilter(results: any[], value: any, filter: Filter) {
    const array = [];
    results.forEach((result) => {
      if (filter.isValid(result)) {
        array.push(result[value]);
      }
    });
    return array;
  }
}
export const utilHelper = new UtilHelper();
