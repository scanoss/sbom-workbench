import { IBatchInventory, Inventory, InventoryAction } from '@api/types';
import { inventoryService } from '@api/services/inventory.service';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { fileService } from '@api/services/file.service';

export const createInventory = createAsyncThunk('inventory/create', async (inventory: Inventory, { dispatch }) => {
  const response = await inventoryService.create(inventory);
  return response;
});

export const updateInventory = createAsyncThunk('inventory/update', async (inventory: Inventory, { dispatch }) => {
  const response = await inventoryService.update(inventory);
  return response;
});

export const deleteInventory = createAsyncThunk('inventory/delete', async (id: number, { dispatch }) => {
  const response = await inventoryService.delete({ id });
  return response;
});

export const attachFile = createAsyncThunk(
  'inventory/attach',
  async ({ id, files }: { id: number; files: number[] }, { dispatch }) => {
    const response = await inventoryService.attach({ id, files });
    return response;
  }
);

export const detachFile = createAsyncThunk('inventory/detach', async (files: number[], { dispatch }) => {
  const response = await inventoryService.detach({ files });
  return response;
});

export const ignoreFile = createAsyncThunk('inventory/ignore', async (files: number[], { dispatch }) => {
  const response = await fileService.ignored(files);
  return response;
});

export const restoreFile = createAsyncThunk('inventory/restore', async (files: number[], { dispatch }) => {
  const response = await inventoryService.detach({ files });
  return response;
});

export const executeBatch = createAsyncThunk(
  'inventory/executeBatch',
  async ({ action, data }: IBatchInventory, { dispatch }) => {
    const response = await inventoryService.batch({
      action,
      overwrite: false,
      data,
    });
    return response;
  }
);
