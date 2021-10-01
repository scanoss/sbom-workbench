const fs = require('fs');

export class WsUtils {
  public async fileExist(file: string): Promise<boolean> {
    return fs.promises
      .access(file, fs.constants.F_OK)
      .then(() => true)
      .catch(() => false);
  }
}
