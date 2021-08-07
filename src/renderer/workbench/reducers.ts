import { LOAD_SCAN_FAIL, LOAD_SCAN_SUCCESS, RESET, SET_COMPONENT, SET_COMPONENTS, SET_FILE } from './actions';
import { ComponentGroup } from '../../api/types';

export interface State {
  loaded: boolean;
  tree: any[] | null;
  file: string | null;
  components: ComponentGroup[] | null;
  component: ComponentGroup | null;
}

export const initialState: State = {
  loaded: false,
  tree: null,
  file: null,
  components: null,
  component: null,
};

export default function reducer(state: State = initialState, action): State {
  switch (action.type) {
    case LOAD_SCAN_SUCCESS: {
      const { tree, components } = action;
      return {
        ...state,
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
