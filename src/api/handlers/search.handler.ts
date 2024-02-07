import api from '../api';
import log from 'electron-log';
import { IpcChannels } from '../ipc-channels';
import { SearchTask } from '../../main/task/search/searchTask/SearchTask';
import { ISearchTask } from '../../main/task/search/searchTask/ISearchTask';
import { ipcMain } from 'electron';

let search = null;

ipcMain.on(IpcChannels.SEARCH_ENGINE_SEARCH, async (event, params: ISearchTask) => {
  if (search) {
    search.finish();
  }
  search = new SearchTask();
  search
    .run(params)
    .then((response) => {
      search = null;
      event.sender.send(IpcChannels.SEARCH_ENGINE_SEARCH_RESPONSE, response);
      return true;
    })
    .catch((error: Error) => {
      log.error('[SEARCH ENGINE]: ', error.message);
    });
});
