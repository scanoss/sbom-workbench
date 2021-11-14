import {
  LOAD_SCAN_FAIL,
  LOAD_SCAN_SUCCESS,
  RESET,
  SET_COMPONENTS,
  SET_COMPONENT,
  SET_VERSION,
  SET_FILE,
  SET_PROGRESS,
  SET_HISTORY,
  UPDATE_FILETREE,
  SET_FOLDER,
} from './actions';
import { ComponentGroup } from '../../../api/types';

export interface State {
  name: string;
  loaded: boolean;
  progress: number;
  summary: any;
  tree: any;
  file: string | null;
  mainComponents: ComponentGroup[];
  components: ComponentGroup[];
  component: ComponentGroup;
  version: string;
  history: {
    report: 'detected' | 'identified';
    section: number;
  };
  filter: {
    path: string;
  }
}

export const initialState: State = {
  name: null,
  loaded: false,
  progress: 0,
  summary: null,
  tree: null,
  file: null,
  mainComponents: null,
  components: null,
  component: null,
  version: null,
  history: {
    report: 'detected',
    section: null,
  },
  filter: {
    path: null,
  }
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
        mainComponents: components,
        components,
      };
    }
    case LOAD_SCAN_FAIL: {
      return {
        ...state,
        loaded: false,
      };
    }
    case UPDATE_FILETREE: {
      const { node } = action;
      return {
        ...state,
        tree: node, // TODO: update node tree
      };
    }
    case SET_PROGRESS: {
      const { summary } = action;
      const progress =
        summary?.detectedFiles === 0
          ? 100
          : ((summary?.identifiedFiles + summary?.ignoredFiles) * 100) / summary?.detectedFiles;
      return {
        ...state,
        summary,
        progress,
      };
    }
    case SET_COMPONENTS: {
      const { components } = action;
      return {
        ...state,
        mainComponents: components,
        components,
      };
    }
    case SET_COMPONENT: {
      const { component } = action;
      return {
        ...state,
        component,
        version: null,
        history: {
          ...state.history,
          section: null,
        },
      };
    }
    case SET_VERSION: {
      const { version } = action;
      return {
        ...state,
        version,
      }
    }
    case SET_FILE: {
      const { file } = action;
      return {
        ...state,
        file,
      };
    }
    case SET_HISTORY: {
      const { crumb } = action;
      return {
        ...state,
        history: {
          ...state.history,
          ...crumb,
        },
      };
    }
    case SET_FOLDER: {
      const { node } = action;
      return {
        ...state,
        components: node ? filter(state.mainComponents, node.components) : state.mainComponents,
        filter: {
          ...state.filter,
          path: node ? node.path : null,
        },
      };
    }
    case RESET:
      return { ...initialState };
    default:
      return state;
  }
}

const filter = (components, node) => {
  const keys = new Map<string, Map<string, any>>(
    node.map(el => [ `${el.purl[0]}-${el.version}`, true])
    //node.map(el => [ `${el.purl[0]}`])
  );

  return components.filter(el => {
    console.log(el)
    return el.versions.some(v => keys.has(`${el.purl}-${v.version}`))
  });
}
