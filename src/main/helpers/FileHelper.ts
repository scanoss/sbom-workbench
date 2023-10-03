import fs from 'fs';
import { modelProvider } from '../services/ModelProvider';

class FileHelper {

  /**
   * @Brief Get objects with file path and database id
   * @Return Object with file path and database id
   * */
  public async getPathFileId(): Promise<Record<string, number>> {
    const files = await modelProvider.model.file.getAll(null);
    const pathFileId = files.reduce((acc, file) => {
      acc[file.path] = file.id;
      return acc;
    }, {});
    return pathFileId;
  }

  public async fileExist(file: string): Promise<boolean> {
    return fs.promises
      .access(file, fs.constants.F_OK)
      .then(() => true)
      .catch(() => false);
  }
}

export const fileHelper = new FileHelper();
