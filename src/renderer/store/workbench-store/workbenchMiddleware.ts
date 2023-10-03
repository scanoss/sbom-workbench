import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { loadProject, loadProjectSettings } from './workbenchThunks';

export const workbenchMiddleware = createListenerMiddleware();

workbenchMiddleware.startListening({
  matcher: isAnyOf(loadProject.fulfilled),
  effect: async (action, listenerApi) => {
    listenerApi.dispatch(loadProjectSettings());
  },
});
