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
import { componentService } from '../../../api/component-service';

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
  history: {
    report: 'detected' | 'identified';
    section: number;
  };
  filter: {
    version: string;
    node?: {
      type: 'folder' | 'file';
      path: string;
    };
  };
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
  history: {
    report: 'detected',
    section: null,
  },
  filter: {
    version: null,
    node: null,
  },
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
        history: {
          ...state.history,
          section: null,
        },
        filter: {
          ...state.filter,
          version: null,
        },
      };
    }
    case SET_VERSION: {
      const { version } = action;
      return {
        ...state,
        filter: {
          ...state.filter,
          version,
        },
      };
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
          node: node
            ? {
                type: 'folder',
                path: node.value,
              }
            : null,
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
  const keys = new Map<string, Map<string, any>>(node.map((el) => [`${el.purl[0]}-${el.version}`, true]));

  return components.filter((el) => {
    return el.versions.some((v) => keys.has(`${el.purl}-${v.version}`));
  });
};
