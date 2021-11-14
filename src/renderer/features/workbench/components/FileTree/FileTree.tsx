import React, { useContext, useState } from 'react';
import CheckboxTree, { OnCheckNode } from 'react-checkbox-tree';
import { useHistory } from 'react-router-dom';
import { projectService } from '../../../../../api/project-service';
import { setFolder } from '../../actions';
import { IWorkbenchContext, WorkbenchContext } from '../../store';

export const FileTree = () => {
  const history = useHistory();

  const { state, dispatch } = useContext(WorkbenchContext) as IWorkbenchContext;

  const { tree } = state;

  const aTree = [tree];

  const [expanded, setExpanded] = useState<string[]>([aTree && aTree[0] ? aTree[0].value : '']);

  const onSelectFile = async (node: OnCheckNode) => {
    const { children, value } = node;
    if (!children) {
      history.push(`/workbench/detected/file?path=${encodeURIComponent(value)}`);
    } else  {
      const fileTreeNode = getNode(node);
      dispatch(setFolder(fileTreeNode || null));
      history.push(`/workbench/detected`);
    }
  };

  const getNode = (target) => {
   return target.parent.children?.find(el => el.value === target.value);
  }

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
