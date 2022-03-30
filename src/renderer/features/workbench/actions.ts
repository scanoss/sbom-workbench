import { IDependencyResponse } from 'scanoss';
import { ComponentGroup, Node, IWorkbenchFilter } from '../../../api/types';

export const LOAD_SCAN_SUCCESS = 'APP/WORKBENCH/LOAD_SCAN_SUCCESS';
export const LOAD_SCAN_FAIL = 'APP/WORKBENCH/LOAD_SCAN_FAIL';
export const UPDATE_FILETREE = 'APP/WORKBENCH/UPDATE_FILETREE';
export const SET_PROGRESS = 'APP/WORKBENCH/SET_PROGRESS';
export const SET_COMPONENTS = 'APP/WORKBENCH/SET_COMPONENTS';
export const SET_COMPONENT = 'APP/WORKBENCH/SET_COMPONENT';
export const SET_VERSION = 'APP/WORKBENCH/SET_VERSION';
export const SET_HISTORY = 'APP/WORKBENCH/SET_HISTORY';
export const SET_NODE = 'APP/WORKBENCH/SET_NODE';
export const SET_FILTER = 'APP/WORKBENCH/SET_FILTER';
export const RESET_FILTER = 'APP/WORKBENCH/RESET_FILTER';
export const SET_RECENT_USED_COMPONENT = 'APP/WORKBENCH/SET_RECENT_USED_COMPONENT';
export const RESET = 'APP/WORKBENCH/RESET';

export const loadScanSuccess = (name, imported, tree, components: ComponentGroup[], dependencies: Set<string>) => ({
  type: LOAD_SCAN_SUCCESS,
  name,
  imported,
  tree,
  dependencies,
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

export const setFilter = (filter: IWorkbenchFilter, override = false) => ({
  type: SET_FILTER,
  filter,
  override,
});

export const setRecentUsedComponent = (purl: string) => ({
  type: SET_RECENT_USED_COMPONENT,
  purl,
});

export const resetFilter = () => ({
  type: RESET_FILTER,
});

export const reset = () => ({
  type: RESET,
});
