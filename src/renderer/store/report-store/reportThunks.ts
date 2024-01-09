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
  const promises = [cryptographyService.update(), vulnerabilityService.update()];
  await Promise.all(promises);
  return true;
});
