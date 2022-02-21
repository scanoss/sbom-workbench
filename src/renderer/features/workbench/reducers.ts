import { IDependencyResponse } from 'scanoss';
import {
  LOAD_SCAN_FAIL,
  LOAD_SCAN_SUCCESS,
  RESET,
  SET_COMPONENTS,
  SET_COMPONENT,
  SET_VERSION,
  SET_PROGRESS,
  SET_HISTORY,
  UPDATE_FILETREE,
  SET_NODE,
  SET_RECENT_USED_COMPONENT,
  SET_FILTER,
} from './actions';
import { ComponentGroup, IWorkbenchFilter, Node } from '../../../api/types';

const MAX_RECENT_USED_COMPONENTS = 3;

export interface State {
  name: string;
  imported: boolean;
  loaded: boolean;
  progress: number;
  summary: any;
  tree: any;
  dependencies: IDependencyResponse;
  file: string | null;
  mainComponents: ComponentGroup[];
  recentUsedComponents: ComponentGroup[];
  components: ComponentGroup[];
  component: ComponentGroup;
  history: {
    section: number;
  };
  node: Node;
  version: string;
  filter: IWorkbenchFilter;
}

export const initialState: State = {
  name: null,
  imported: false,
  loaded: false,
  progress: 0,
  summary: null,
  tree: null,
  dependencies: null,
  file: null,
  mainComponents: null,
  recentUsedComponents: null,
  components: null,
  component: null,
  history: {
    section: null,
  },
  node: null,
  version: null,
  filter: {},
};

export default function reducer(state: State = initialState, action): State {
  switch (action.type) {
    case LOAD_SCAN_SUCCESS: {
      const { name, imported, tree, components, dependencies } = action;
      return {
        ...state,
        name,
        imported,
        loaded: true,
        tree,
        dependencies,
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
        tree: node,
      };
    }
    case SET_PROGRESS: {
      const { summary } = action;
      const progress =
        summary?.detectedFiles === 0
          ? 100
          : ((summary?.detectedIdentifiedFiles + summary?.ignoredFiles) * 100) / summary?.detectedFiles;
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
        version: null,
      };
    }
    case SET_VERSION: {
      const { version } = action;
      return {
        ...state,
        version,
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
    case SET_NODE: {
      const { node } = action;
      return {
        ...state,
        node,
        filter: clean({
          ...state.filter,
          path: node?.type === 'folder' ? node.path : null,
        }),
      };
    }
    case SET_RECENT_USED_COMPONENT: {
      const { component } = action;
      if (state.recentUsedComponents) {
        if (!state.recentUsedComponents.some((el) => el.purl === component.purl)) {
          state.recentUsedComponents.splice(0, 0, component);
        } else {
          const index = state.recentUsedComponents.findIndex((el) => el.purl === component.purl);

          state.recentUsedComponents.splice(index, 1);
          state.recentUsedComponents.splice(0, 0, component);
        }
      } else state.recentUsedComponents = [component];

      if (state.recentUsedComponents?.length >= MAX_RECENT_USED_COMPONENTS) {
        state.recentUsedComponents.splice(MAX_RECENT_USED_COMPONENTS, 1);
      }

      return {
        ...state,
      };
    }
    case SET_FILTER: {
      const { filter, override } = action;
      return {
        ...state,
        filter: clean(override ? filter : { ...state.filter, ...filter }),
      };
    }
    case RESET:
      return { ...initialState };
    default:
      return state;
  }
}

const clean = (obj) => {
  const filter = Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null));
  return Object.keys(filter).length === 0 ? null : filter;
};
