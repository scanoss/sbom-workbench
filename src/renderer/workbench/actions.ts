import { Component } from "./types";

export const LOAD_SCAN_SUCCESS = 'APP/WORKBENCH/LOAD_SCAN_SUCCESS';
export const SET_COMPONENT = 'APP/WORKBENCH/SET_COMPONENT';
export const SET_FILE = 'APP/WORKBENCH/SET_FILE';
export const RESET = 'APP/WORKBENCH/RESET';

export const loadScanSuccess = (scan, tree, components) => ({
  type: LOAD_SCAN_SUCCESS,
  scan,
  tree,
  components,
});

export const setComponent = (component: Component) => ({
  type: SET_COMPONENT,
  component,
});

export const setFile = (file: string) => ({
  type: SET_FILE,
  file,
});

export const reset = () => ({
  type: RESET,
});
