import {
  IBatchInventory,
  Inventory,
  InventoryAction,
  InventorySourceType,
  ReuseIdentificationTaskDTO
} from '@api/types';
import { inventoryService } from '@api/services/inventory.service';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { fileService } from '@api/services/file.service';
import { projectService } from '@api/services/project.service';

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

export const acceptInventoryKnowledge = createAsyncThunk('inventory/acceptInventoryKnowledge', async (params: ReuseIdentificationTaskDTO, { dispatch }) => {
 const response =  await projectService.acceptInventoryKnowledge(params)
  return response;
})

export const executeBatch = createAsyncThunk(
  'inventory/executeBatch',
  async (iBatchInventory: IBatchInventory, { dispatch }) => {
    const response = await inventoryService.batch(iBatchInventory);
    return response;
  }
);
