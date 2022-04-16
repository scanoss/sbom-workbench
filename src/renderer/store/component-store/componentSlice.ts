import { Component, ComponentGroup } from '@api/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchComponents } from './componentThunks';
import { RootState } from '../rootReducer';

export interface ComponentState {
  components: ComponentGroup[];
  component: ComponentGroup | null;
  loading: boolean;
}

const initialState: ComponentState = {
  components: [],
  component: null,
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
  },
});
// actions
export const { setComponents, setComponent } = componentSlice.actions;

// selectors
export const selectComponentState = (state: RootState) => state.component;

export default componentSlice.reducer;
