import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { dialogController } from '../../controllers/dialog-controller';
import { loadProject, loadProjectSettings } from './workbenchThunks';

export const workbenchMiddleware = createListenerMiddleware();

workbenchMiddleware.startListening({
  matcher: isAnyOf(loadProject.fulfilled),
  effect: async (action, listenerApi) => {
    listenerApi.dispatch(loadProjectSettings());
  },
});

workbenchMiddleware.startListening({
  matcher: isAnyOf(loadProject.rejected),
  effect: async ({ error }, listenerApi) => {
    listenerApi.cancelActiveListeners();
    await dialogController.showError('Open Project Error', error.message);
    window.history.back();
  },
});
