import { Inventory, InventoryAction } from '@api/types';
import { inventoryService } from '@api/services/inventory.service';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { fileService } from '@api/services/file.service';
import { update } from '../workbench-store/workbenchThunks';

export const createInventory = createAsyncThunk('inventory/create', async (inventory: Inventory, { dispatch }) => {
  const response = await inventoryService.create(inventory);
  // if (inventory) dispatch(setRecentUsedComponent(inventory.purl));

  dispatch(update());
  return response;
});

export const updateInventory = createAsyncThunk('inventory/update', async (inventory: Inventory, { dispatch }) => {
  const response = await inventoryService.update(inventory);

  dispatch(update());
  return response;
});

export const deleteInventory = createAsyncThunk('inventory/delete', async (id: number, { dispatch }) => {
  const response = await inventoryService.delete({ id });

  dispatch(update());
  return response;
});

export const attachFile = createAsyncThunk(
  'inventory/attach',
  async ({ id, files }: { id: number; files: number[] }, { dispatch }) => {
    const response = await inventoryService.attach({ id, files });

    dispatch(update());
    return response;
  }
);

export const detachFile = createAsyncThunk('inventory/detach', async (files: number[], { dispatch }) => {
  const response = await inventoryService.detach({ files });

  dispatch(update());
  return response;
});

export const ignoreFile = createAsyncThunk('inventory/ignore', async (files: number[], { dispatch }) => {
  const response = await fileService.ignored(files);

  dispatch(update());
  return response;
});

export const restoreFile = createAsyncThunk('inventory/restore', async (files: number[], { dispatch }) => {
  const response = await inventoryService.detach({ files });

  dispatch(update());
  return response;
});

export const executeBatch = createAsyncThunk(
  'inventory/executeBatch',
  async ({ path, action, data }: { path: string; action: InventoryAction; data?: any }, { dispatch }) => {
    const response = await inventoryService.folder({
      action,
      folder: path,
      overwrite: false,
      ...data,
    });

    dispatch(update());
    return response;
  }
);
