import { LOAD_SCAN_FAIL, LOAD_SCAN_SUCCESS, RESET, SET_COMPONENT, SET_COMPONENTS, SET_FILE, SET_PROGRESS } from './actions';
import { ComponentGroup } from '../../../api/types';

export interface State {
  name: string;
  loaded: boolean;
  progress: number,
  tree: any[];
  file: string | null;
  components: ComponentGroup[];
  component: ComponentGroup;
}

export const initialState: State = {
  name: null,
  loaded: false,
  progress: 0,
  tree: null,
  file: null,
  components: null,
  component: null,
};

export default function reducer(state: State = initialState, action): State {
  switch (action.type) {
    case LOAD_SCAN_SUCCESS: {
      const { name, tree, components } = action;
      return {
        ...state,
        name,
        loaded: true,
        tree,
        components,
      };
    }
    case LOAD_SCAN_FAIL: {
      return {
        ...state,
        loaded: false,
      };
    }
    case SET_PROGRESS: {
      const { summary } = action;
      const progress = Math.floor(((summary?.identifiedFiles + summary?.ignoredFiles) * 100) / summary?.detectedFiles);
      return {
        ...state,
        progress,
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
