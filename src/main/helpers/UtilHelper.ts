import { Filter } from '../batch/Filter/Filter';

class UtilHelper {
  /**
   * @brief data to be coverted to string
   * @returns string of values
   */

  public convertsArrayOfStringToString(data: Array<any>, param?: any): string {
    let out = '';
    if (param) for (const element of data) {
      out += `"${element[param]}",`;
    }
    else for (const element of data) out += `${element},`;
    out = out.slice(0, -1);
    return out;
  }

  /**
   * @brief data to be filtered
   * @param value to create resulting array
   * @param filter filter to be applied over the data
   * @returns array of values
   */
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
