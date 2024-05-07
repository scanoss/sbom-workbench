import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { RootState } from '@store/rootReducer';
import { ReportSummary } from '@api/types';
import { ReportData } from 'electron-log';
import { getReport } from './reportThunks';

export interface ReportState {
  summary: ReportSummary,
  detected: ReportData;
  identified: ReportData;

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
        components: getComponentsGrouped(detected.licenses),
      };

      state.identified = {
        ...identified,
        components: getComponentsGrouped(identified.licenses),
      };

      state.isLoading = false;
    },
    [getReport.rejected.type]: (state) => { state.isLoading = false; },
  },
});

const getComponentsGrouped = (data: any[]) => {
  const group = (acc, current) => { // groupByPurlVersionSourceManifest
    const key = `${current.purl}@${current.version}-${current.source}-${current.manifestFile}`;
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
