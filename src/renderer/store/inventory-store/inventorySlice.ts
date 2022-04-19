import { createListenerMiddleware, createSlice } from '@reduxjs/toolkit';
import { createInventory } from './inventoryThunks';

export interface InventoryState {
  loading: boolean;
}

const initialState: InventoryState = {
  loading: false,
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: { },
  extraReducers: {
    [createInventory.pending.type]: (state) => {
      state.loading = true;
    },
    [createInventory.fulfilled.type]: (state) => {
      state.loading = false;
    },
    [createInventory.rejected.type]: (state) => {
      state.loading = false;
    },
  },
});

// actions

export default inventorySlice.reducer;
