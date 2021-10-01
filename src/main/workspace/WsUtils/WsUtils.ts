const fs = require('fs');

class WsUtils {
  public async fileExist(file: string): Promise<boolean> {
    return fs.promises
      .access(file, fs.constants.F_OK)
      .then(() => true)
      .catch(() => false);
  }
}

export const wsUtils = new WsUtils();
