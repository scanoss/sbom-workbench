import { Dependency } from '@api/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { accept, acceptAll, getAll, reject, rejectAll, restore } from '@store/dependency-store/dependencyThunks';
import { RootState } from '@store/rootReducer';

export interface DependencyState {
  dependencies: Dependency[];
  loading: boolean;
}

const initialState: DependencyState = {
  dependencies: [],
  loading: false,
};

export const dependencySlice = createSlice({
  name: 'dependency',
  initialState,
  reducers: {
    reset: (state) => initialState,
  },
  extraReducers: {
    [getAll.pending.type]: (state) => {
      state.loading = true;
    },
    [getAll.fulfilled.type]: (state, action: PayloadAction<Dependency[]>) => {
      state.loading = false;
      state.dependencies = action.payload;
    },
    [getAll.rejected.type]: (state) => {
      state.loading = false;
    },
    [accept.fulfilled.type]: (state, action: PayloadAction<Dependency>) => {
      state.dependencies = state.dependencies.map((dependency) =>
        dependency.dependencyId === action.payload.dependencyId ? action.payload : dependency
      );
    },
    [reject.fulfilled.type]: (state, action: PayloadAction<Dependency>) => {
      state.dependencies = state.dependencies.map((dependency) =>
        dependency.dependencyId === action.payload.dependencyId ? action.payload : dependency
      );
    },
    [restore.fulfilled.type]: (state, action: PayloadAction<Dependency>) => {
      state.dependencies = state.dependencies.map((dependency) =>
        dependency.dependencyId === action.payload.dependencyId ? action.payload : dependency
      );
    },
    [acceptAll.pending.type]: (state) => {
      state.loading = true;
    },
    [acceptAll.fulfilled.type]: (state) => {
      state.loading = false;
    },
    [acceptAll.rejected.type]: (state) => {
      state.loading = false;
    },
    [rejectAll.pending.type]: (state) => {
      state.loading = true;
    },
    [rejectAll.fulfilled.type]: (state) => {
      state.loading = false;
    },
    [rejectAll.rejected.type]: (state) => {
      state.loading = false;
    },
  },
});

// actions
export const { reset } = dependencySlice.actions;

// selectors
export const selectDependencyState = (state: RootState) => state.dependency;

export default dependencySlice.reducer;
