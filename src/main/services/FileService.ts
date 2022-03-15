import { modelProvider } from './ModelProvider';

class FileService {
  public async insert(files: Array<any>) {
    await modelProvider.model.file.insertFiles(files);
  }
}

export const fileService = new FileService();
