/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Tree, { renderers as Renderers } from 'react-virtualized-tree';
import { useDispatch, useSelector } from 'react-redux';
import useContextual from '@hooks/useContextual';
import { collapseTree, expandTree, selectWorkbench, updateTree } from '@store/workbench-store/workbenchSlice';
import { selectNavigationState } from '@store/navigation-store/navigationSlice';
import { CircularProgress } from '@mui/material';
import { ipcRenderer } from 'electron';
import { IpcChannels } from '@api/ipc-channels';

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

  const { tree } = useSelector(selectWorkbench);
  const state = useSelector(selectNavigationState);
  const selectedNode = React.useRef<any>(null);

  const onActionMenuHandler = (e, params) => {
    const { current: node } = selectedNode;
    switch (params) {
      case 'action-restore':
        contextual.restore(node);
        break;
      case 'action-original':
        contextual.ignore(node);
        break;
      case 'action-aceptAll':
        contextual.acceptAll(node);
        break;
      case 'action-identifyAllAs':
        contextual.identifyAll(node);
        break;
      case 'action-markAllAsOriginal':
        contextual.ignoreAll(node);
        break;
      case 'action-restoreAll':
        contextual.restoreAll(node);
        break;
      case 'action-expandAll':
        onExpandAll(node);
        break;
      case 'action-expandAllToMatches':
        onExpandAll(node, true);
        break;
      case 'action-colapseAll':
        onCollapseAll(node);
        break;
      case 'action-AceptAllDependencies':
        contextual.acceptAllDependencies(node);
        break;
      case 'action-dismissAllDependencies':
        contextual.rejectAllDependencies(node);
        break;
      case 'action-restorellDependencies':
        contextual.restoreAllDependencies(node);
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
          label: 'Accept all dependencies',
          actionId: 'action-AceptAllDependencies',
          enabled: node.status === 'PENDING',
        },
        {
          label: 'Dismiss all dependencies',
          actionId: 'action-dismissAllDependencies',
          enabled: node.status === 'PENDING',
        },
        {
          label: 'Restore all dependencies',
          actionId: 'action-restorellDependencies',
          // enabled: node.status === 'PENDING',
        },
      ];
    } else {
      menu = !node.children
        ? [
            {
              label: 'Mark file as original',

              // click: () => contextual.ignore(node),
              actionId: 'action-original',
              // enabled: !onlyRestore && node.status !== 'FILTERED' && node.status !== 'NO-MATCH',
              enabled: node.status !== 'FILTERED' && node.status !== 'NO-MATCH' && !node.isDependencyFile, // TODO: CHECK WITH FRANCO
            },
            {
              label: 'Restore file',
              actionId: 'action-restore',
              enabled: node.status === 'IDENTIFIED' || node.status === 'IGNORED',
            },
          ]
        : [
            {
              label: !state.isFilterActive ? 'Accept all' : 'Accept all filtered files',
              actionId: 'action-aceptAll',
              enabled: !onlyRestore,
            },
            { type: 'separator' },
            {
              label: !state.isFilterActive ? 'Identify all files as...' : 'Identify all filtered files as...',
              actionId: 'action-identifyAllAs',
              enabled: !onlyRestore,
            },
            {
              label: !state.isFilterActive ? 'Mark all files as original' : 'Mark all filtered files as original',
              actionId: 'action-markAllAsOriginal',
              enabled: !onlyRestore,
            },
            {
              label: !state.isFilterActive ? 'Restore all files' : 'Restore all filtered files',
              actionId: 'action-restoreAll',
              enabled: node.hasIgnoredProgress || node.hasIdentifiedProgress,
            },
            { type: 'separator' },
            {
              label: 'Expand/Collapse',
              submenu: [
                {
                  label: 'Expand all',
                  actionId: 'action-expandAll',
                },
                {
                  label: 'Expand to matches',
                  actionId: 'action-expandAllToMatches',
                },
                {
                  label: 'Collapse all',
                  actionId: 'action-colapseAll',
                },
              ],
            },
          ];
    }
    window.electron.ipcRenderer.send(IpcChannels.DIALOG_BUILD_CUSTOM_POPUP_MENU, menu);
  };

  useEffect(() => {
    window.electron.ipcRenderer.on(IpcChannels.CONTEXT_MENU_COMMAND, onActionMenuHandler);
    return () => {
      window.electron.ipcRenderer.removeListener(IpcChannels.CONTEXT_MENU_COMMAND, onActionMenuHandler);
    };
  }, []);

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
