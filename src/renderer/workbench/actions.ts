import { Component } from '../../api/types';

export const LOAD_SCAN_SUCCESS = 'APP/WORKBENCH/LOAD_SCAN_SUCCESS';
export const LOAD_SCAN_FAIL = 'APP/WORKBENCH/LOAD_SCAN_FAIL';
export const SET_COMPONENT = 'APP/WORKBENCH/SET_COMPONENT';
export const SET_COMPONENTS = 'APP/WORKBENCH/SET_COMPONENTS';
export const SET_FILE = 'APP/WORKBENCH/SET_FILE';
export const RESET = 'APP/WORKBENCH/RESET';

export const loadScanSuccess = (tree, components) => ({
  type: LOAD_SCAN_SUCCESS,
  tree,
  components,
});

export const setComponent = (component: Component) => ({
  type: SET_COMPONENT,
  component,
});

export const setComponents = (components: Component[]) => ({
  type: SET_COMPONENTS,
  components,
});

export const setFile = (file: string) => ({
  type: SET_FILE,
  file,
});

export const reset = () => ({
  type: RESET,
});
