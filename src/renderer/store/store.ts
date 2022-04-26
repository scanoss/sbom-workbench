import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import { inventoryMiddleware } from '@store/inventory-store/inventoryMiddleware';
import { rootMiddleware } from '@store/rootMiddleware';
import { dependencyMiddleware } from '@store/dependency-store/dependencyMiddleware';
import rootReducer, { RootState } from './rootReducer';

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(rootMiddleware.middleware)
      .prepend(inventoryMiddleware.middleware)
      .prepend(dependencyMiddleware.middleware)

});

export type AppDispatch = typeof store.dispatch;
export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>;

export default store;
