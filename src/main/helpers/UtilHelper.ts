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

}
export const utilHelper = new UtilHelper();
