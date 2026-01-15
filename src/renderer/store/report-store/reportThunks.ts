import { createAsyncThunk } from '@reduxjs/toolkit';
import { reportService } from '@api/services/report.service';
import { vulnerabilityService } from '@api/services/vulnerability.service';
import { cryptographyService } from '@api/services/cryptography.service';
import { RootState } from '@store/rootReducer';

export const getReport = createAsyncThunk(
  'report/getReport',
  async (_, { getState }) => {
    const isLoaded = () => (getState() as RootState).workbench.loaded;

    try {
      const summary = await reportService.getSummary();
      if (!isLoaded()) return null;

      const detected = await reportService.detected();
      if (!isLoaded()) return null;

      const identified = await reportService.identified();
      if (!isLoaded()) return null;

      return { summary, detected, identified };
    } catch (e: any) {
      // Ignore errors when project is closed during fetch
      if (!isLoaded()) return null;
      throw e;
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as RootState;
      return state.workbench.loaded;
    },
  }
);

export const forceUpdate = createAsyncThunk(
  'report/forceUpdate',
  async () => {
    // workaround: second IPC call is lost in promise All
    const delayedPromise = new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const response = await cryptographyService.update();
          resolve(response);
        } catch (e) {
          reject(e);
        }
      }, 100);
    });

    const promises = [vulnerabilityService.update(), delayedPromise];
    const all = await Promise.allSettled(promises);
    return all;
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as RootState;
      return state.workbench.loaded;
    },
  }
);
