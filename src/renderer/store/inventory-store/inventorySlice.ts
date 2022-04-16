import { createSlice } from '@reduxjs/toolkit';
import { createInventory } from './inventoryThunks';

export interface InventoryState {
  loading: boolean;
  recents: string[];
}

const initialState: InventoryState = {
  loading: false,
  recents: [],
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

export default inventorySlice.reducer;
