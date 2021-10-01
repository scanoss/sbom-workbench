import { ComponentGroup } from '../../../api/types';

export const LOAD_SCAN_SUCCESS = 'APP/WORKBENCH/LOAD_SCAN_SUCCESS';
export const LOAD_SCAN_FAIL = 'APP/WORKBENCH/LOAD_SCAN_FAIL';
export const SET_PROGRESS = 'APP/WORKBENCH/SET_PROGRESS';
export const SET_COMPONENTS = 'APP/WORKBENCH/SET_COMPONENTS';
export const SET_COMPONENT = 'APP/WORKBENCH/SET_COMPONENT';
export const SET_VERSION = 'APP/WORKBENCH/SET_VERSION';
export const SET_FILE = 'APP/WORKBENCH/SET_FILE';
export const SET_HISTORY = 'APP/WORKBENCH/SET_HISTORY';

export const RESET = 'APP/WORKBENCH/RESET';

export const loadScanSuccess = (name, tree, components: ComponentGroup[]) => ({
  type: LOAD_SCAN_SUCCESS,
  name,
  tree,
  components,
});

export const setProgress = (summary: any) => ({
  type: SET_PROGRESS,
  summary,
});

export const setComponent = (component: ComponentGroup) => ({
  type: SET_COMPONENT,
  component,
});

export const setComponents = (components: ComponentGroup[]) => ({
  type: SET_COMPONENTS,
  components,
});

export const setVersion = (version: string) => ({
  type: SET_VERSION,
  version,
});

export const setFile = (file: string) => ({
  type: SET_FILE,
  file,
});

export const setHistoryCrumb = (crumb) => ({
  type: SET_HISTORY,
  crumb,
});

export const reset = () => ({
  type: RESET,
});
