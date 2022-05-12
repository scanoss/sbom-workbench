import { ipcMain } from "electron";
import { IpcEvents } from '../ipc-events';
import { Response } from '../Response';
import { SearchTask } from "../../main/task/search/searchTask/SearchTask";
import { ISearchTask } from "../../main/task/search/searchTask/ISearchTask";

ipcMain.handle(IpcEvents.SEARCH_ENGINE_SEARCH, async (_event, params: ISearchTask) => {
  try {
   const response = await new SearchTask().run(params);
    return Response.ok({ message: 'License created successfully', data: response });
  } catch (error: any) {
    console.log('Catch an error: ', error);
    return Response.fail({ message: error.message });
  }
});
