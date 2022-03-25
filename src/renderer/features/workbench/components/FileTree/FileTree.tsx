/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Tree, { renderers as Renderers, selectors } from 'react-virtualized-tree';
import { collapseAll, convertTreeToNode, expandAll, expandToMatches } from '../../../../../shared/utils/filetree-utils';
import useContextual from '../../../../hooks/useContextual';
import { IWorkbenchContext, WorkbenchContext } from '../../store';

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

        {node.type === 'file' && !node.isDependencyFile && <i className="fa fa-file" />}

        {node.type === 'file' && node.isDependencyFile && <i className="fa fa-dependency-file" />}
      </span>
      <span className='ft-node-label'>{node.name}</span>
    </span>
  );
};

const FileTree = () => {
  const history = useHistory();
  const contextual = useContextual();

  const { state } = useContext(WorkbenchContext) as IWorkbenchContext;
  const { tree, file } = state;

  const [nodes, setNodes] = React.useState([]);

  const handleChange = (nodes) => {
    setNodes(nodes);
  };

  const onSelectNode = async (_e: React.MouseEvent<HTMLSpanElement, MouseEvent>, node: any) => {
    console.log(node);
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
    const onlyRestore = node.status === 'IDENTIFIED' || node.status === 'IGNORED' || node.status === 'FILTERED';
    const menu = !node.children
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
            label: 'Accept all',
            click: () => contextual.acceptAll(node),
            enabled: !onlyRestore,
          },
          { type: 'separator' },
          {
            label: 'Identify all files as...',
            click: () => contextual.identifyAll(node),
            enabled: !onlyRestore,
          },
          {
            label: 'Mark all files as original',
            click: () => contextual.ignoreAll(node),
            enabled: !onlyRestore,
          },
          {
            label: 'Restore all files',
            click: () => contextual.restoreAll(node),
            enabled: node.hasIdentified || node.hasIgnored,
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

    Menu.buildFromTemplate(menu).popup(remote.getCurrentWindow());
  };

  const onExpandAll = (node: any, toMatch = false) => {
    const ns = !toMatch ? expandAll(nodes, node) : expandToMatches(nodes, node);
    setNodes(ns);
  };

  const onCollapseAll = (node: any) => {
    const ns = collapseAll(nodes, node);
    setNodes(ns);
  };

  useEffect(() => {
    if (tree) {
      setNodes(convertTreeToNode(tree, nodes.length > 0 ? nodes : [tree]));
    }
  }, [tree]);


  return (
    <div className="file-tree-container">
      {tree ? (
        <Tree nodes={nodes} onChange={handleChange}>
          {({ style, node, ...rest }: any) => (
            <div
              style={{ ...style, ...{ paddingLeft: style.marginLeft, margin: 0 } }}
              className={`ft-node ${node.className} ${node.id === state.node?.path ? 'selected' : ''} ${node.isFilteredMatch ? 'matched' : ''} ${node.isDependencyFile ? 'is-dependency-file' : ''}`}
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
      ) : (
        <div className="loader">
          <span>Indexing...</span>
        </div>
      )}
    </div>
  );
};

export default FileTree;
