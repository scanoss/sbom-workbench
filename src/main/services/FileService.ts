import { FileDTO, GetFileDTO } from "@api/dto";
import { modelProvider } from './ModelProvider';
import { QueryBuilderCreator } from "../model/queryBuilder/QueryBuilderCreator";

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

  public async get(params: GetFileDTO): Promise<FileDTO> {
    try {
      const queryBuilder = QueryBuilderCreator.create(params);
      const file = await modelProvider.model.file.get(queryBuilder);
      return file;
    }catch (e: any){
      return e;
    }
  }
}

export const fileService = new FileService();
