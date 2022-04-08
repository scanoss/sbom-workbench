import { modelProvider } from './ModelProvider';

class FileService {
  public async insert(files: Array<any>) {
    await modelProvider.model.file.insertFiles(files);
  }

  public async ignore(fileIds: number[]) {
    try {
      const success = await modelProvider.model.file.ignored(fileIds);
      return success;
    } catch (e) {
      return e;
    }
  }

  public async getFileIdFromPath(path: string): Promise<number> {
    try {
      const file = await modelProvider.model.file.getIdFromPath(path);
      return file;
    }catch (e: any){
      return e;
    }
  }
}

export const fileService = new FileService();
