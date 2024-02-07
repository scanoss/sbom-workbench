/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Tree, { renderers as Renderers } from 'react-virtualized-tree';
import { useDispatch, useSelector } from 'react-redux';
import useContextual from '@hooks/useContextual';
import { collapseTree, expandTree, selectWorkbench, updateTree } from '@store/workbench-store/workbenchSlice';
import { selectNavigationState } from '@store/navigation-store/navigationSlice';
import { CircularProgress } from '@mui/material';
import { IpcChannels } from '@api/ipc-channels';
import { useTranslation } from 'react-i18next';
import { FileStatusType } from '@api/types';
import useMode from '@hooks/useMode';

const { Expandable } = Renderers;

const FileTreeNode = ({ node, onClick, onContextMenu }) => {
  return (
    <span
      className={`ft-node-title ${node.type}`}
      onClick={(e) => onClick(e, node)}
      onContextMenu={(e) => onContextMenu(e, node)}
    >
      <span className="ft-node-icon">
        {node.type === 'folder' &&
          (node.state?.expanded ? <i className="fa fa-folder-open" /> : <i className="fa fa-folder" />)}

        {node.type === 'file' && !node.isDependencyFile && <i className="fa fa-file-o" />}

        {node.type === 'file' && node.isDependencyFile && <i className="fa fa-dependency-file" />}
      </span>
      <span className="ft-node-label">{node.name}</span>
    </span>
  );
};

const FileTree = () => {
  const navigate = useNavigate();
  const contextual = useContextual();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { menu: menuProps } = useMode();

  const { tree } = useSelector(selectWorkbench);
  const state = useSelector(selectNavigationState);
  const selectedNode = React.useRef<any>(null);

  const onActionMenuHandler = (e, params) => {
    console.log(params);
    const { current: node } = selectedNode;

    switch (params) {
      case 'Action:RestoreFile':
        contextual.restore(node);
        break;
      case 'Action:MarkFileAsOriginal':
        contextual.ignore(node);
        break;
      case 'Action:AcceptAll':
        contextual.acceptAll(node);
        break;
      case 'Action:IdentifyAllAs':
        contextual.identifyAll(node, FileStatusType.PENDING);
        break;
      case 'Action:IdentifyNoMatch':
        contextual.identifyAll(node, FileStatusType.NOMATCH);
        break;
      case 'Action:IdentifyIgnored':
        contextual.identifyAll(node, FileStatusType.FILTERED);
        break;
      case 'Action:MarkAllAsOriginal':
        contextual.ignoreAll(node, FileStatusType.PENDING);
        break;
      case 'Action:MarkNoMatchAsOriginal':
        contextual.ignoreAll(node, FileStatusType.NOMATCH);
        break;
      case 'Action:MarkIgnoredAsOriginal':
        contextual.ignoreAll(node, FileStatusType.FILTERED);
        break;
      case 'Action:RestoreAll':
        contextual.restoreAll(node);
        break;
      case 'Action:ExpandAll':
        onExpandAll(node);
        break;
      case 'Action:ExpandToMatches':
        onExpandAll(node, true);
        break;
      case 'Action:CollapseAll':
        onCollapseAll(node);
        break;
      case 'Action:AcceptAllDependencies':
        contextual.acceptAllDependencies(node);
        break;
      case 'Action:DismissAllDependencies':
        contextual.rejectAllDependencies(node);
        break;
      case 'Action:RestorellDependencies':
        contextual.restoreAllDependencies(node);
        break;
      case 'Action:ImportFrom':
        contextual.importFrom(node);
        break;

      default:
        break;
    }
  };

  const onChange = (nodes) => {
    dispatch(updateTree(nodes));
  };

  const onExpandAll = (node: any, toMatch = false) => {
    dispatch(expandTree({ node, toMatch }));
  };

  const onCollapseAll = (node: any) => {
    dispatch(collapseTree(node));
  };


  const onSelectNode = async (_e: React.MouseEvent<HTMLSpanElement, MouseEvent>, node: any) => {
    const { children, value } = node;
    if (!children) {
      navigate({
        pathname: '/workbench/detected/file',
        search: `?path=file|${encodeURIComponent(value)}`,
      });
    } else {
      navigate({
        pathname: '/workbench/detected',
        search: node.value ? `?path=folder|${encodeURIComponent(value)}` : null,
      });
    }
  };

  const onContextMenu = (_e: React.MouseEvent<HTMLSpanElement, MouseEvent>, node: any) => {
    const onlyRestore = !node.hasPendingProgress;
    selectedNode.current = node;
    let menu = [];
    if (node.isDependencyFile) {
      menu = [
        {
          label: t('AppMenu:AcceptAllDependencies'),
          actionId: 'Action:AcceptAllDependencies',
          enabled: menuProps.enabled && node.status === 'PENDING',
        },
        {
          label:  t('AppMenu:DismissAllDependencies'),
          actionId: 'Action:DismissAllDependencies',
          enabled: menuProps.enabled && node.status === 'PENDING',
        },
        {
          label: t('AppMenu:RestoreAllDependencies'),
          actionId: 'Action:RestorellDependencies',
          enabled: menuProps.enabled,
        },
      ];
    } else {
      menu = !node.children
        ? [
            {
              label: t('AppMenu:MarkFileAsOriginal'),
              actionId: 'Action:MarkFileAsOriginal',
              enabled: menuProps.enabled && (node.status !== 'FILTERED' && node.status !== 'NO-MATCH' && !node.isDependencyFile),
            },
            {
              label: t('AppMenu:RestoreFile'),
              actionId: 'Action:RestoreFile',
              enabled: menuProps.enabled && (menuProps.enabled || node.status === 'IDENTIFIED' || node.status === 'IGNORED'),
            },
          ]
        : [
            {
              label: t('AppMenu:AcceptAll', { context: state.isFilterActive ? 'filter' : 'nofilter' }),
              actionId: 'Action:AcceptAll',
              enabled: menuProps.enabled && !onlyRestore,
            },
            { type: 'separator' },
            {
              label: t('AppMenu:IdentifyAllAs', { context: state.isFilterActive ? 'filter' : 'nofilter' }),

              submenu: [
                {
                  label: t('AppMenu:IdentifyDetected'),
                  actionId: 'Action:IdentifyAllAs',
                  enabled:  (node.someMatchChild && (state?.filter?.status !== FileStatusType.FILTERED && state?.filter?.status !== FileStatusType.NOMATCH &&  state?.filter?.status !== FileStatusType.IDENTIFIED && state?.filter?.status !== FileStatusType.ORIGINAL)),
                },
                {
                  label: t('AppMenu:IdentifyNoMatch'),
                  actionId: 'Action:IdentifyNoMatch',
                  enabled: (node.someNoMatchChild || (node.someNoMatchChild && state?.filter?.status === FileStatusType.NOMATCH)) && (state?.filter?.status !== FileStatusType.FILTERED && state?.filter?.status !== FileStatusType.PENDING &&  state?.filter?.status !== FileStatusType.IDENTIFIED && state?.filter?.status !== FileStatusType.ORIGINAL),
                },
                {
                  label: t('AppMenu:IdentifyIgnored'),
                  actionId: 'Action:IdentifyIgnored',
                  enabled: (node.someFilteredChild || (node.someFilteredChild && state?.filter?.status === FileStatusType.FILTERED)) && (state?.filter?.status !== FileStatusType.NOMATCH && state?.filter?.status !== FileStatusType.PENDING &&  state?.filter?.status !== FileStatusType.IDENTIFIED && state?.filter?.status !== FileStatusType.ORIGINAL),

                }
              ],
              enabled: menuProps.enabled && !node.value.toString().startsWith('/.'),
            },
            {
              label: t('AppMenu:MarkAllAsOriginal', { context: state.isFilterActive ? 'filter' : 'nofilter' }),
              submenu: [
                {
                  label: t('AppMenu:MarkDetectedAsOriginal'),
                  actionId: 'Action:MarkAllAsOriginal',
                  enabled: node.someMatchChild && (state?.filter?.status !== FileStatusType.FILTERED && state?.filter?.status !== FileStatusType.NOMATCH &&  state?.filter?.status !== FileStatusType.IDENTIFIED),
                },
                {
                  label: t('AppMenu:MarkNoMatchAsOriginal'),
                  actionId: 'Action:MarkNoMatchAsOriginal',
                  enabled: (node.someNoMatchChild || (node.someNoMatchChild && (state?.filter?.status === FileStatusType.NOMATCH && state?.filter?.status === FileStatusType.ORIGINAL))) && (state?.filter?.status !== FileStatusType.FILTERED && state?.filter?.status !== FileStatusType.PENDING &&  state?.filter?.status !== FileStatusType.IDENTIFIED && state?.filter?.status !== FileStatusType.ORIGINAL),
                },
                {
                  label: t('AppMenu:MarkIgnoredAsOriginal'),
                  actionId: 'Action:MarkIgnoredAsOriginal',
                  enabled: (node.someFilteredChild || (node.someFilteredChild && (state?.filter?.status === FileStatusType.FILTERED || state?.filter?.status === FileStatusType.ORIGINAL))) && (state?.filter?.status !== FileStatusType.NOMATCH && state?.filter?.status !== FileStatusType.PENDING && state?.filter?.status !== FileStatusType.IDENTIFIED ),

                }
              ],
              enabled: menuProps.enabled && !node.value.toString().startsWith('/.') ,
            },
            {
              label: t('AppMenu:RestoreAll', { context: state.isFilterActive ? 'filter' : 'nofilter' }),
              actionId: 'Action:RestoreAll',
              enabled: menuProps.enabled && (node.hasIgnoredProgress || node.hasIdentifiedProgress),
            },
            { type: 'separator' },
            {
              label: t('AppMenu:ImportFrom'),
              actionId: 'Action:ImportFrom',
              enabled: menuProps.enabled,
            },
            { type: 'separator' },
            {
              label: t('AppMenu:ExpandCollapse'),
              submenu: [
                {
                  label: t('AppMenu:ExpandAll'),
                  actionId: 'Action:ExpandAll',
                },
                {
                  label: t('AppMenu:ExpandToMatches'),
                  actionId: 'Action:ExpandToMatches',
                },
                {
                  label: t('AppMenu:CollapseAll'),
                  actionId: 'Action:CollapseAll',
                },
              ],
            },
          ];
    }
    window.electron.ipcRenderer.send(IpcChannels.DIALOG_BUILD_CUSTOM_POPUP_MENU, menu);
  };

  const setupListeners = (): () => void => {
    const subscriptions = [];
    subscriptions.push(window.electron.ipcRenderer.on(IpcChannels.CONTEXT_MENU_COMMAND, onActionMenuHandler));
    return () => subscriptions.forEach((unsubscribe) => unsubscribe());
  };

  // setupListeners
  useEffect(setupListeners, []);

  return (
    <div className="file-tree-container">
      {state.loading && (
        <div className="spinner-loader">
          <CircularProgress size={12} />
        </div>
      )}
      <Tree nodes={tree} onChange={onChange}>
        {({ style, node, ...rest }: any) => (
          <div
            style={{ ...style, ...{ paddingLeft: style.marginLeft, margin: 0 } }}
            className={`
              ft-node
              ${node.className}
              ${node.id === state.node?.path ? 'selected' : ''}
              ${node.isFilteredMatch ? 'matched' : ''}
              ${node.isDependencyFile ? 'is-dependency-file' : ''}
            `}
          >
            <Expandable
              node={node}
              {...rest}
              iconsClassNameMap={{
                expanded: 'fa fa-angle-down',
                collapsed: 'fa fa-angle-right',
              }}
            >
              <FileTreeNode node={node} onClick={onSelectNode} onContextMenu={onContextMenu} />
            </Expandable>
          </div>
        )}
      </Tree>
    </div>
  );
};

export default FileTree;
