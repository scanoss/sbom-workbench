import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { RootState } from '@store/rootReducer';
import { getReport } from './reportThunks';

export interface ReportState {
  detected: any; // TODO: create interface
  identified: any; // TODO: create interface

  isLoading: boolean;
}

const initialState: ReportState = {
  detected: null,
  identified: null,

  isLoading: false,
};

export const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    reset: (state) => initialState,
  },
  extraReducers: {
    [getReport.pending.type]: (state) => { state.isLoading = true; },
    [getReport.fulfilled.type]: (state, action: PayloadAction<any>) => {
      const { summary, detected, identified } = action.payload;
      state.detected = { ...detected, summary };
      state.identified = { ...identified, summary };
      state.isLoading = false;
    },
    [getReport.rejected.type]: (state) => { state.isLoading = false; },
  },
});

// actions
export const { reset } = reportSlice.actions;

// selectors
export const selectReportState = (state: RootState) => state.report;

// default reducer
export default reportSlice.reducer;
