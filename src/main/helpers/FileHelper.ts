import { serviceProvider } from '../services/ServiceProvider';

class FileHelper {
  public async getPathFileId(): Promise<Record<string, number>> {
    const files = await serviceProvider.model.file.getAll(null);
    const pathFileId = files.reduce((acc, file) => {
      acc[file.path] = file.id;
      return acc;
    }, {});
    return pathFileId;
  }
}

export const fileHelper = new FileHelper();
