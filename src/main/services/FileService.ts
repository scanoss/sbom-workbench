import { FileDTO, GetFileDTO } from "@api/dto";
import { modelProvider } from './ModelProvider';
import { QueryBuilderCreator } from "../model/queryBuilder/QueryBuilderCreator";
import { HttpProxy, HttpProxyConfig } from "scanoss";
import { userSettingService } from "./UserSettingService";
import { workspace } from "../../main/workspace/Workspace";
import AppConfig from "../../config/AppConfigModule";
import log from 'electron-log';
import { getHttpConfig } from "./utils/httpUtil";

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

  public async getRemoteFileContent(fileHash: string): Promise<string> {

    const project = workspace.getOpenedProjects()[0];
    const {
      DEFAULT_API_INDEX,
      APIS
    } = userSettingService.get();
   
    const scanossHttp = new HttpProxy(getHttpConfig());

    const URL = project.getApi() ?  project.getApi() : APIS[DEFAULT_API_INDEX].URL;
    const fileContentUrl = `${URL}${AppConfig.API_CONTENT_PATH}/${fileHash}`;

    const response = await scanossHttp.get(fileContentUrl);

    if(!response.ok){
      log.error('[ REMOTE FILE CONTENT ]: ', response.status, response.statusText);
      return response.statusText;
    }
    const fileContent = await response.text();
    return fileContent;
}
}

export const fileService = new FileService();
