import { IWorkbenchFilter, Node } from '@api/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@store/rootReducer';

export interface NavigationState {
  node: Node;
  loading: boolean;
  filter: IWorkbenchFilter;
  isFilterActive: boolean;
  version: string;
}

const initialState: NavigationState = {
  node: null,
  filter: {},
  loading: false,
  isFilterActive: false,
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
      state.isFilterActive = !!state.filter?.status || !!state.filter?.usage || !!state.filter?.filename;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    resetFilter: (state) => {
      state.filter = clean({ ...state.filter, usage: null, status: null, filename: null });
      state.isFilterActive = false;
    },
    setCurrentNode: (state, action: PayloadAction<any>) => {
      console.log('current node: ', action.payload);
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
    reset: (state) => initialState,
  },
});

// actions
export const { setFilter, resetFilter, setLoading, setCurrentNode, setVersion, reset } = NavigationSlice.actions;

// selectors
export const selectNavigationState = (state: RootState) => state.navigation;

export default NavigationSlice.reducer;
