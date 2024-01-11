import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { RootState } from '@store/rootReducer';
import { getReport } from './reportThunks';

export interface ReportState {
  summary: any,
  detected: any; // TODO: create interface
  identified: any; // TODO: create interface

  isLoading: boolean;
}

const initialState: ReportState = {
  summary: null,
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
      state.summary = summary;
      state.detected = {
        ...detected,
        components: groupByPurlVersion(detected.licenses),
      };

      state.identified = {
        ...identified,
        components: groupByPurlVersion(identified.licenses),
      };

      state.isLoading = false;
    },
    [getReport.rejected.type]: (state) => { state.isLoading = false; },
  },
});

const groupByPurlVersion = (data: any[]) => {
  const group = (acc, current) => { // groupByPurlAndVersion
    const key = `${current.purl}@${current.version}`;
    if (acc[key]) {
      acc[key].licenses.push(current.license);
    } else {
      acc[key] = {
        ...current,
        licenses: [current.license],
      };
    }
    return acc;
  };

  const items: any[] = Object.values(data
    .map((license: any) => license.components.map((item) => ({ ...item, license: license.label })))
    .flat()
    .reduce(group, {})) // TODO: try to return an array
    .sort((a: any, b: any) => a.name.localeCompare(b.name));

  return items;
};

// actions
export const { reset } = reportSlice.actions;

// selectors
export const selectReportState = (state: RootState) => state.report;

// default reducer
export default reportSlice.reducer;
