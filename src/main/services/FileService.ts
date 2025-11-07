import { FileDTO, GetFileDTO } from '@api/dto';
import { HttpClient } from 'scanoss';
import log from 'electron-log';
import { modelProvider } from './ModelProvider';
import { QueryBuilderCreator } from '../model/queryBuilder/QueryBuilderCreator';
import AppConfig from '../../config/AppConfigModule';
import { getHttpConfig } from './utils/httpUtil';

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
  // TODO: Move this call to scanoss.js SDK
  public async getRemoteFileContent(fileHash: string): Promise<string> {
    const clientConfig = getHttpConfig();
    const scanossHttp = new HttpClient(clientConfig);
    const fileContentUrl = `${clientConfig.HOST_URL}${AppConfig.API_CONTENT_PATH}/${fileHash}`;
    const response = await scanossHttp.get(fileContentUrl);

    if (!response.ok) {
      log.error('[ REMOTE FILE CONTENT ]: ', response.status, response.statusText);
      return response.statusText;
    }
    const fileContent = await response.text();
    return fileContent;
  }
}

export const fileService = new FileService();
