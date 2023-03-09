import { ComponentGroup } from '@api/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchComponent, fetchComponents } from './componentThunks';
import { RootState } from '../rootReducer';

const MAX_RECENT_USED_COMPONENTS = 5;

export interface ComponentState {
  components: ComponentGroup[];
  component: ComponentGroup | null;
  recents: string[];
  loading: boolean;
}

const initialState: ComponentState = {
  components: [],
  component: null,
  recents: [],
  loading: false,
};

export const componentSlice = createSlice({
  name: 'component',
  initialState,
  reducers: {
    setComponents: (state, action: PayloadAction<ComponentGroup[]>) => {
      state.components = action.payload;
    },
    setComponent: (state, action: PayloadAction<ComponentGroup | null>) => {
      state.component = action.payload;
    },
    setRecentComponent: (state, action: PayloadAction<string>) => {
      const purl = action.payload;
      if (state.recents && state.recents.length > 0) {
        state.recents = state.recents.filter((c) => c !== purl);
        state.recents.unshift(purl);
        if (state.recents.length > MAX_RECENT_USED_COMPONENTS) state.recents.pop();
      } else state.recents = [purl];
    },
    reset: (state) => initialState,
  },
  extraReducers: {
    [fetchComponents.pending.type]: (state) => {
      state.loading = true;
    },
    [fetchComponents.fulfilled.type]: (state, action: PayloadAction<ComponentGroup[]>) => {
      state.loading = false;
      state.components = action.payload;
    },
    [fetchComponents.rejected.type]: (state) => {
      state.loading = false;
    },
    [fetchComponent.fulfilled.type]: (state, action: PayloadAction<ComponentGroup>) => {
      state.component = action.payload;
    },
  },
});
// actions
export const { setComponents, setComponent, setRecentComponent, reset } = componentSlice.actions;

// selectors
export const selectComponentState = (state: RootState) => state.component;

export default componentSlice.reducer;
