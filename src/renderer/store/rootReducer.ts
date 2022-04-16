import { combineReducers } from '@reduxjs/toolkit';
import workbenchReducer from './workbench-store/workbenchSlice';
import componentReducer from './component-store/componentSlice';
import inventoryReducer from './inventory-store/inventorySlice';
import navigationReducer from './navigation-store/navigationSlice';

const rootReducer = combineReducers({
  workbench: workbenchReducer,
  component: componentReducer,
  inventory: inventoryReducer,
  navigation: navigationReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
