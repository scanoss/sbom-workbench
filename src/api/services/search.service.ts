import { IpcEvents } from '../ipc-events';
import { BaseService } from './base.service';
import { ISearchTask } from "../../main/task/search/searchTask/ISearchTask";

const { ipcRenderer } = require('electron');

class SearchService extends BaseService {
  public async search(params: ISearchTask): Promise<any> {
    const response = await ipcRenderer.invoke(IpcEvents.SEARCH_ENGINE_SEARCH, params);
    return this.response(response);
  }
}

export const searchService = new SearchService();
