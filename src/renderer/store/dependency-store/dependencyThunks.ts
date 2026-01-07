import { createAsyncThunk } from '@reduxjs/toolkit';
import { dependencyService } from '@api/services/dependency.service';
import {
  AcceptAllDependeciesDTO,
  NewDependencyDTO,
  RejectAllDependeciesDTO,
  RestoreAllDependenciesDTO,
} from '@api/dto';
import { RootState } from '@store/rootReducer';

export const getAll = createAsyncThunk(
  'dependency/fetchAll',
  async (path: string) => {
    const response = await dependencyService.getAll({ path });
    return response;
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as RootState;
      return state.workbench.loaded;
    },
  }
);

export const getAllManifestFiles = createAsyncThunk(
  'dependency/fetchAllManifestFiles',
  async () => {
    const response = await dependencyService.getManifestFileSummary();
    return response;
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as RootState;
      return state.workbench.loaded;
    },
  }
);

export const accept = createAsyncThunk('dependency/accept', async (dependencyDTO: NewDependencyDTO) => {
  const response = await dependencyService.accept(dependencyDTO);
  return response;
});

export const reject = createAsyncThunk('dependency/reject', async (dependencyId: number) => {
  const response = await dependencyService.reject(dependencyId);
  return response;
});

export const restore = createAsyncThunk('dependency/restore', async (dependencyId: number) => {
  const response = await dependencyService.restore(dependencyId);
  return response;
});

export const acceptAll = createAsyncThunk(
  'dependency/acceptAll',
  async (acceptAllDependeciesDTO: AcceptAllDependeciesDTO) => {
    const response = await dependencyService.acceptAll(acceptAllDependeciesDTO);
    return response;
  },
);

export const rejectAll = createAsyncThunk(
  'dependency/rejectAll',
  async (rejectAllDependeciesDTO: RejectAllDependeciesDTO) => {
    const response = await dependencyService.rejectAll(rejectAllDependeciesDTO);
    return response;
  },
);

export const restoreAll = createAsyncThunk(
  'dependency/restoreAll',
  async (restoreAllDependenciesDTO: RestoreAllDependenciesDTO) => {
    const response = await dependencyService.restoreAll(restoreAllDependenciesDTO);
    return response;
  },
);
