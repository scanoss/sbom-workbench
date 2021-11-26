import React, { useContext, useState, useEffect } from 'react';
import CheckboxTree, { OnCheckNode } from 'react-checkbox-tree';
import { useHistory } from 'react-router-dom';
import { componentService } from '../../../../../api/component-service';
import { ComponentSource } from '../../../../../main/db/scan_component_db';
import { setFolder } from '../../actions';
import { IWorkbenchContext, WorkbenchContext } from '../../store';

export const FileTree = () => {
  const history = useHistory();

  const { state, dispatch, setNode } = useContext(WorkbenchContext) as IWorkbenchContext;

  const { tree, filter, file } = state;

  const [aTree, setAtree] = useState([]);

  const [expanded, setExpanded] = useState<string[]>([aTree && aTree[0] ? aTree[0].value : '']);

  const onSelectFile = async (node: OnCheckNode) => {
    const { children, value } = node;

    const fileTreeNode = getNode(node);

    if (!children) {
      setNode({
        type: 'file',
        path: value,
      });
    } else {
      setNode(
        fileTreeNode
          ? {
              type: 'folder',
              path: fileTreeNode.value || null,
            }
          : null
      );
    }

    setAtree([tree]);
  };

  const getNode = (target) => {
    const node = target.parent.children?.find((el) => el.value === target.value);
    if (node) node.label = <span data-value={node.value}>{node.label}</span>;
    return node;
  };

  useEffect(() => {
    document.querySelectorAll('.rct-text.selected').forEach((el) => el.classList.remove('selected'));
    if (!filter.node?.path && !file) {
      document.querySelector('.react-checkbox-tree .rct-text')?.classList.add('selected');
      return;
    }

    const value = filter.node?.path || file;
    const node = document.querySelector(`[data-value="${value}"]`);
    node?.closest('.rct-text')?.classList.add('selected');
  }, [filter.node, file, aTree]);

  useEffect(() => {
    if (tree) {
      setAtree([tree]);
    }
  }, [tree]);

  return (
    <>
      {tree ? (
        <CheckboxTree
          nodes={aTree || []}
          expanded={expanded}
          onClick={(targetNode) => onSelectFile(targetNode)}
          onExpand={(expandedItems) => setExpanded(expandedItems)}
        />
      ) : (
        <div className="loader">
          <span>Indexing...</span>
        </div>
      )}
    </>
  );
};

export default FileTree;
