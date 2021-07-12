import { LOAD_SCAN_SUCCESS, RESET, SET_COMPONENT, SET_FILE } from './actions';
import { Component } from './types';

export interface State {
  scan: Record<string, any> | null;
  tree: [] | null;
  file: string | null;
  components: Component[] | null;
  component: Component | null;
  matchInfo: Record<string, any>[] | null;
}

export const initialState: State = {
  scan: null,
  tree: null,
  file: null,
  components: null,
  component: null,
  matchInfo: null,
};

export default function reducer(state: State = initialState, action): State {
  switch (action.type) {
    case LOAD_SCAN_SUCCESS: {
      const { scan, tree, components } = action;
      return {
        ...state,
        scan,
        tree,
        components,
      };
    }
    case SET_COMPONENT: {
      const { component } = action;
      return {
        ...state,
        component,
      };
    }
    case SET_FILE: {
      const { scan } = state;
      const { file } = action;

      let matchInfo = null;
      if (scan && file && scan[file][0].id !== 'none') {
        matchInfo = scan[file];
      }

      return {
        ...state,
        file,
        matchInfo,
      };
    }
    case RESET:
      return { ...initialState };
    default:
      return state;
  }
}
