/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import { useHistory } from 'react-router-dom';
import Tree, { renderers as Renderers } from 'react-virtualized-tree';
import { useDispatch, useSelector } from 'react-redux';
import useContextual from '@hooks/useContextual';
import { collapseTree, expandTree, selectWorkbench, updateTree } from '@store/workbench-store/workbenchSlice';
import { selectNavigationState } from '@store/navigation-store/navigationSlice';
import { CircularProgress } from '@material-ui/core';

const { Expandable } = Renderers;

const electron = window.require('electron');
const { remote } = electron;
const { Menu } = remote;

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
  const history = useHistory();
  const contextual = useContextual();
  const dispatch = useDispatch();

  const { tree } = useSelector(selectWorkbench);
  const state = useSelector(selectNavigationState);

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
      history.push({
        pathname: '/workbench/detected/file',
        search: `?path=file|${encodeURIComponent(value)}`,
      });
    } else {
      history.push({
        pathname: '/workbench/detected',
        search: node.value ? `?path=folder|${encodeURIComponent(value)}` : null,
      });
    }
  };

  const onContextMenu = (_e: React.MouseEvent<HTMLSpanElement, MouseEvent>, node: any) => {
    const onlyRestore = !node.hasPendingProgress;

    let menu = [];
    if (node.isDependencyFile) {
      menu = [
        {
          label: 'Accept all dependencies',
          click: () => contextual.acceptAllDependencies(node),
          enabled: node.status === 'PENDING',
        },
        {
          label: 'Dismiss all dependencies',
          click: () => contextual.rejectAllDependencies(node),
          enabled: node.status === 'PENDING',
        },
        {
          label: 'Restore all dependencies',
          click: () => contextual.restoreAllDependencies(node),
          // enabled: node.status === 'PENDING',
        },
      ];
    } else {
      menu = !node.children
        ? [
            {
              label: 'Mark file as original',
              click: () => contextual.ignore(node),
              enabled: !onlyRestore && node.status !== 'FILTERED' && node.status !== 'NO-MATCH',
            },
            {
              label: 'Restore file',
              click: () => contextual.restore(node),
              enabled: node.status === 'IDENTIFIED' || node.status === 'IGNORED',
            },
          ]
        : [
            {
              label: !state.isFilterActive ? 'Accept all' : 'Accept all filtered files',
              click: () => contextual.acceptAll(node),
              enabled: !onlyRestore,
            },
            { type: 'separator' },
            {
              label: !state.isFilterActive ? 'Identify all files as...' : 'Identify all filtered files as...',
              click: () => contextual.identifyAll(node),
              enabled: !onlyRestore,
            },
            {
              label: !state.isFilterActive ? 'Mark all files as original' : 'Mark all filtered files as original',
              click: () => contextual.ignoreAll(node),
              enabled: !onlyRestore,
            },
            {
              label: !state.isFilterActive ? 'Restore all files' : 'Restore all filtered files',
              click: () => contextual.restoreAll(node),
              enabled: node.hasIgnoredProgress || node.hasIdentifiedProgress,
            },
            { type: 'separator' },
            {
              label: 'Expand/Collapse',
              submenu: [
                {
                  label: 'Expand all',
                  click: () => onExpandAll(node),
                },
                {
                  label: 'Expand to matches',
                  click: () => onExpandAll(node, true),
                },
                {
                  label: 'Collapse all',
                  click: () => onCollapseAll(node),
                },
              ],
            },
          ];
    }
    Menu.buildFromTemplate(menu).popup(remote.getCurrentWindow());
  };

  // loader
  if (!tree || tree.length === 0) {
    return (
      <div className="loader">
        <span>Indexing...</span>
      </div>
    );
  }
  return (
    <div className="file-tree-container">

      { state.loading &&
        <div className="spinner-loader">
          <CircularProgress size={12} />
        </div>
      }
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
