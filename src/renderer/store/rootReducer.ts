import { combineReducers } from '@reduxjs/toolkit';
import workspaceReducer from './workspace-store/workspaceSlice';
import workbenchReducer from './workbench-store/workbenchSlice';
import componentReducer from './component-store/componentSlice';
import inventoryReducer from './inventory-store/inventorySlice';
import navigationReducer from './navigation-store/navigationSlice';
import dependencyReducer from './dependency-store/dependencySlice';

const rootReducer = combineReducers({
  workspace: workspaceReducer,
  workbench: workbenchReducer,
  component: componentReducer,
  inventory: inventoryReducer,
  dependency: dependencyReducer,
  navigation: navigationReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
