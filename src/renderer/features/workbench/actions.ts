import { ComponentGroup, Node } from '../../../api/types';

export const LOAD_SCAN_SUCCESS = 'APP/WORKBENCH/LOAD_SCAN_SUCCESS';
export const LOAD_SCAN_FAIL = 'APP/WORKBENCH/LOAD_SCAN_FAIL';
export const UPDATE_FILETREE = 'APP/WORKBENCH/UPDATE_FILETREE';
export const SET_PROGRESS = 'APP/WORKBENCH/SET_PROGRESS';
export const SET_COMPONENTS = 'APP/WORKBENCH/SET_COMPONENTS';
export const SET_COMPONENT = 'APP/WORKBENCH/SET_COMPONENT';
export const SET_VERSION = 'APP/WORKBENCH/SET_VERSION';
export const SET_FILE = 'APP/WORKBENCH/SET_FILE';
export const SET_HISTORY = 'APP/WORKBENCH/SET_HISTORY';
export const SET_FOLDER = 'APP/WORKBENCH/SET_FILTER_FOLDER';
export const SET_NODE = 'APP/WORKBENCH/SET_NODE';

export const RESET = 'APP/WORKBENCH/RESET';

export const loadScanSuccess = (name, tree, components: ComponentGroup[]) => ({
  type: LOAD_SCAN_SUCCESS,
  name,
  tree,
  components,
});

export const updateTree = (node: any) => ({
  type: UPDATE_FILETREE,
  node,
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

export const setHistoryCrumb = (crumb) => ({
  type: SET_HISTORY,
  crumb,
});

export const setCurrentNode = (node: Node) => ({
  type: SET_NODE,
  node,
});

export const reset = () => ({
  type: RESET,
});
