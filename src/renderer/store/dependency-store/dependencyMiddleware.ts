import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { acceptAll, getAll, rejectAll } from '@store/dependency-store/dependencyThunks';
import { RootState } from '@store/rootReducer';

export const dependencyMiddleware = createListenerMiddleware();

dependencyMiddleware.startListening({
  matcher: isAnyOf(acceptAll.fulfilled, rejectAll.fulfilled),
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    listenerApi.dispatch(getAll(state.navigation.node.path));
  },
});
