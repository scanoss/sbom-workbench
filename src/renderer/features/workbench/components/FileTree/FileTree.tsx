import React, { useContext, useState } from 'react';
import CheckboxTree, { OnCheckNode } from 'react-checkbox-tree';
import { useHistory } from 'react-router-dom';
import { IWorkbenchContext, WorkbenchContext } from '../../store';

export const FileTree = () => {
  const history = useHistory();

  const { state } = useContext(WorkbenchContext) as IWorkbenchContext;

  const { tree } = state;

  const [checked, setChecked] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string[]>([tree && tree[0] ? tree[0].value : '']);

  const onSelectFile = ({ children, value }: OnCheckNode) => {
    if (!children) {
      history.push(`/workbench/detected/file?path=${encodeURIComponent(value)}`);
    }
  };

  return (
    <>
      {tree ? (
        <CheckboxTree
          nodes={tree || []}
          checked={checked}
          expanded={expanded}
          onClick={(targetNode) => onSelectFile(targetNode)}
          expandOnClick
          onCheck={(checkedItems) => setChecked(checkedItems)}
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
