import { combineReducers } from '@reduxjs/toolkit';
import workspaceReducer from './workspace-store/workspaceSlice';
import workbenchReducer from './workbench-store/workbenchSlice';
import inventoryReducer from './inventory-store/inventorySlice';
import navigationReducer from './navigation-store/navigationSlice';
import dependencyReducer from './dependency-store/dependencySlice';
import componentReducer from './component-store/componentSlice';
import reportReducer from './report-store/reportSlice';

const rootReducer = combineReducers({
  workspace: workspaceReducer,
  workbench: workbenchReducer,
  component: componentReducer,
  inventory: inventoryReducer,
  dependency: dependencyReducer,
  navigation: navigationReducer,
  report: reportReducer,

});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
