import { IpcChannels } from '../ipc-channels';
import { BaseService } from './base.service';
import { ISearchTask } from "../../main/task/search/searchTask/ISearchTask";

class SearchService extends BaseService {
  public async search(params: ISearchTask): Promise<any> {
    const response = await window.electron.ipcRenderer.invoke(IpcChannels.SEARCH_ENGINE_SEARCH, params);
    return this.response(response);
  }
}

export const searchService = new SearchService();
