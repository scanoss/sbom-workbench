import log from 'electron-log';
import { IpcChannels } from '../ipc-channels';
import { SearchTask } from '../../main/task/search/searchTask/SearchTask';
import { ISearchTask } from '../../main/task/search/searchTask/ISearchTask';
import { ipcMain } from 'electron';

let search: SearchTask = null;

ipcMain.on(IpcChannels.SEARCH_ENGINE_SEARCH, async (event, params: ISearchTask) => {
  if (search) {
    search.finish();
  }
  try {
    const task = new SearchTask();
    search = task;
    const response = await task.run(params);
    // A newer search may have started while this one was running.
    if (search === task) search = null;
    event.sender.send(IpcChannels.SEARCH_ENGINE_SEARCH_RESPONSE, response);
  } catch (error: any) {
    log.error('[SEARCH ENGINE]: ', error.message);
  }
});
