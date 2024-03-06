import { createAsyncThunk } from '@reduxjs/toolkit';
import { reportService } from '@api/services/report.service';
import { vulnerabilityService } from '@api/services/vulnerability.service';
import { cryptographyService } from '@api/services/cryptography.service';

export const getReport = createAsyncThunk('report/getReport', async () => {
  const summary = await reportService.getSummary();
  const detected = await reportService.detected();
  const identified = await reportService.identified();

  return { summary, detected, identified };
});

export const forceUpdate = createAsyncThunk('report/forceUpdate', async () => {
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
});
