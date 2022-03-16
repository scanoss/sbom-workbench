import { modelProvider } from '../services/ModelProvider';

class FileHelper {
  public async getPathFileId(): Promise<Record<string, number>> {
    const files = await modelProvider.model.file.getAll(null);
    const pathFileId = files.reduce((acc, file) => {
      acc[file.path] = file.id;
      return acc;
    }, {});
    return pathFileId;
  }
}

export const fileHelper = new FileHelper();
