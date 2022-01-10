import React, { useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Tree, { renderers as Renderers, selectors } from 'react-virtualized-tree';
import FolderOutlined from '@material-ui/icons/FolderOutlined';
import { convertTreeToNode } from '../../../../../utils/utils';
import useContextual from '../../../../hooks/useContextual';
import { IWorkbenchContext, WorkbenchContext } from '../../store';

const { Expandable } = Renderers;

const electron = window.require('electron');
const { remote } = electron;
const { Menu } = remote;

const FileTreeNode = ({ node, onClick, onContextMenu }) => {
  return (
    <button
      className="ft-node-title"
      type="button"
      onClick={(e) => onClick(e, node)}
      onContextMenu={(e) => onContextMenu(e, node)}
    >
      <span className="ft-node-icon">
        {node.state?.expanded ? <i className="far fa-folder" /> : <i className="far fa-folder-open" />}
      </span>
      {node.name}
    </button>
  );
};

export const FileTreeVirt = () => {
  const history = useHistory();
  const contextual = useContextual();

  const { state } = useContext(WorkbenchContext) as IWorkbenchContext;
  const { tree, filter, file } = state;

  const [nodes, setNodes] = React.useState([]);

  const handleChange = (nodes) => {
    setNodes(nodes);
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
              }
            ]
          },
        ];

    Menu.buildFromTemplate(menu).popup(remote.getCurrentWindow());
  };

  const onExpandAll = (node: any, toMatch = false) => {
   /*  const nodes = !toMatch ? expandNodesToLevel([node], Infinity) : expandNodesToMatch(node, []);
    setExpanded((expanded) => [...new Set([...expanded, ...nodes])]); */
  };

  const onCollapseAll = (node: any) => {
    /* const nodes = expandNodesToLevel([node], Infinity);
    setExpanded((expanded) =>  expanded.filter((el) => !nodes.includes(el))); */
  };

  useEffect(() => {
    if (tree) {
      setNodes(convertTreeToNode(tree));
    }
  }, [tree]);

  return tree ? (
    <Tree nodes={nodes} onChange={handleChange}>
      {({ style, node, ...rest }) => (
        <div
          style={{ ...style, ...{ paddingLeft: style.marginLeft, margin: 0 } }}
          className={`ft-node ${node.className} ${node.id === filter.node?.path ? 'selected' : ''}`}
        >
          <Expandable
            node={node}
            {...rest}
            iconsClassNameMap={{
              expanded: 'mi mi-folder-open',
              collapsed: 'mi mi-folder',
              lastChild: 'mi mi-insert-drive-file',
            }}
          >
           <FileTreeNode
           node={node}
           onClick={onSelectNode}
           onContextMenu={onContextMenu}
           />
          </Expandable>
        </div>
      )}
    </Tree>
  ) : (
    <div className="loader">
      <span>Indexing...</span>
    </div>
  );
};

export default FileTreeVirt;
