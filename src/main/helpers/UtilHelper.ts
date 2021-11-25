class UtilHelper {
  public getArrayFromObjectValue(files, attribute: any): Array<string> {
    const result: Array<string> = [];
    files.forEach((element) => {
      result.push(element[attribute]);
    });
    return result;
  }
}
export const utilHelper = new UtilHelper();
