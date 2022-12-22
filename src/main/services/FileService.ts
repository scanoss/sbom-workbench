import { FileDTO, GetFileDTO } from "@api/dto";
import { modelProvider } from './ModelProvider';
import { QueryBuilderCreator } from "../model/queryBuilder/QueryBuilderCreator";

class FileService {
  public async insert(files: Array<any>) {
    await modelProvider.model.file.insertFiles(files);
  }

  public async ignore(fileIds: number[]) {
      const success = await modelProvider.model.file.ignored(fileIds);
      return success;
  }

  public async get(params: GetFileDTO): Promise<FileDTO> {
      const queryBuilder = QueryBuilderCreator.create(params);
      const file = await modelProvider.model.file.get(queryBuilder);
      return file;
  }
}

export const fileService = new FileService();
