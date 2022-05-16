import { ipcMain } from 'electron';
import { IpcEvents } from '../ipc-events';
import { Response } from '../Response';
import { SearchTask } from '../../main/task/search/searchTask/SearchTask';
import { ISearchTask } from '../../main/task/search/searchTask/ISearchTask';

let search = null;

ipcMain.on(IpcEvents.SEARCH_ENGINE_SEARCH, async (event, params: ISearchTask) => {
  if (search) {
    search.finish();
  }
  search = new SearchTask();
  search
    .run(params)
    .then((response) => {
      search = null;
      event.sender.send(IpcEvents.SEARCH_ENGINE_SEARCH_RESPONSE, response);
      return true;
    })
    .catch((error: Error) => {
      console.log(error.message);
    });
});
