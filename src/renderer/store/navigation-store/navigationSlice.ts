import { IWorkbenchFilter, Node } from '@api/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../rootReducer';

export interface NavigationState {
  node: Node;
  filter: IWorkbenchFilter;
  version: string;
}

const initialState: NavigationState = {
  node: null,
  filter: {},
  version: null,
};

const clean = (obj) => {
  const filter = Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null));
  return Object.keys(filter).length === 0 ? null : filter;
};

export const NavigationSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<{ filter: IWorkbenchFilter; override?: boolean }>) => {
      const { filter, override } = action.payload;
      state.filter = clean(override ? filter : { ...state.filter, ...filter });
    },
    resetFilter: (state) => {
      state.filter = clean({ ...state.filter, usage: null, status: null });
    },
    setCurrentNode: (state, action: PayloadAction<any>) => {
      const node = action.payload;
      state.node = node;
      state.filter = clean({
        ...state.filter,
        path: node?.type === 'folder' ? node.path : null,
      });
    },
    setVersion: (state, action: PayloadAction<string>) => {
      state.version = action.payload;
    },
  },
});

// actions
export const { setFilter, resetFilter, setCurrentNode, setVersion } = NavigationSlice.actions;

// selectors
export const selectNavigationState = (state: RootState) => state.navigation;

export default NavigationSlice.reducer;
