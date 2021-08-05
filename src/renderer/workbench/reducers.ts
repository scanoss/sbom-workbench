import { LOAD_SCAN_SUCCESS, RESET, SET_COMPONENT, SET_COMPONENTS, SET_FILE } from './actions';
import { Component, ComponentGroup } from '../../api/types';

export interface State {
  scan: Record<string, any> | null;
  tree: [] | null;
  file: string | null;
  components: ComponentGroup[] | null;
  component: ComponentGroup | null;
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
    case SET_COMPONENTS: {
      const { components } = action;
      return {
        ...state,
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
      const { file } = action;

      return {
        ...state,
        file,
      };
    }
    case RESET:
      return { ...initialState };
    default:
      return state;
  }
}
