import { createListenerMiddleware, current, isAnyOf, isRejected } from '@reduxjs/toolkit';
import {
  acceptInventoryKnowledge,
  attachFile,
  createInventory,
  deleteInventory,
  detachFile,
  executeBatch,
  ignoreFile,
  restoreFile,
  updateInventory,
} from '@store/inventory-store/inventoryThunks';
import { RootState } from '@store/rootReducer';
import { fetchComponent, fetchComponents } from '@store/component-store/componentThunks';
import { reportService } from '@api/services/report.service';
import { load, reset, setProgress } from '@store/workbench-store/workbenchSlice';
import * as component from '@store/component-store/componentSlice';
import * as navigation from '@store/navigation-store/navigationSlice';
import * as report from '@store/report-store/reportSlice';

import { loadProject } from '@store/workbench-store/workbenchThunks';
import {
  accept, getAll, getAllManifestFiles, reject, rejectAll, restore, acceptAll, restoreAll
} from '@store/dependency-store/dependencyThunks';
import { dialogController } from 'renderer/controllers/dialog-controller';
import { setCurrentProject } from './workspace-store/workspaceSlice';

export const rootMiddleware = createListenerMiddleware();

rootMiddleware.startListening({
  matcher: isAnyOf(
    loadProject.fulfilled,
    createInventory.fulfilled,
    updateInventory.fulfilled,
    deleteInventory.fulfilled,
    attachFile.fulfilled,
    detachFile.fulfilled,
    ignoreFile.fulfilled,
    restoreFile.fulfilled,
    executeBatch.fulfilled,
    acceptInventoryKnowledge.fulfilled,
    load, // this is a workaround for the fact that still has setFilter on WorkbenchContext
  ),
  effect: async (action, listenerApi) => {
    const state: RootState = listenerApi.getState() as RootState;

    const summary = await reportService.getSummary();
    listenerApi.dispatch(setProgress(summary));

    listenerApi.dispatch(fetchComponents());
    if (state.component.component) {
      listenerApi.dispatch(fetchComponent(state.component.component.purl));
    }
  
  },
});

rootMiddleware.startListening({
  matcher: isAnyOf(loadProject.fulfilled),
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    const currentProject = state.workspace.projects.find((p) => p.work_root === action.payload.projectRoot);
    listenerApi.dispatch(setCurrentProject(currentProject));
  },
});

rootMiddleware.startListening({
  matcher: isAnyOf(
    loadProject.fulfilled,
    accept.fulfilled,
    reject.fulfilled,
    rejectAll.fulfilled,
    restore.fulfilled,
    acceptAll.fulfilled,
    restoreAll.fulfilled,
    load, // this is a workaround for the fact that still has setFilter on WorkbenchContext
  ),
  effect: async (action, listenerApi) => {
    listenerApi.dispatch(getAllManifestFiles());
  },
});

rootMiddleware.startListening({
  matcher: isAnyOf(
    accept.fulfilled,
    reject.fulfilled,
    restore.fulfilled,
    getAll.fulfilled,
    rejectAll.fulfilled,
  ),
  effect: async (action, listenerApi) => {
    const summary = await reportService.getSummary();
    listenerApi.dispatch(setProgress(summary));
    listenerApi.dispatch(getAllManifestFiles());
  },
});

rootMiddleware.startListening({
  actionCreator: reset,
  effect: async (action, api) => {
    api.dispatch(component.reset());
    api.dispatch(navigation.reset());
    api.dispatch(report.reset());
  },
});

const isExcluded = isAnyOf(loadProject.rejected);

rootMiddleware.startListening({
  matcher: isRejected,
  effect: async (action, api) => {
    const { error } = action;
    if (isExcluded(action)) return;

    dialogController.showError('Error', error.message);
  },
});
