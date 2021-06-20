import React, { useContext, useState } from 'react';
import CheckboxTree, { OnCheckNode } from 'react-checkbox-tree';
import { useHistory } from 'react-router-dom';
import { IWorkbenchContext, WorkbenchContext } from '../../WorkbenchProvider';

export const FileTree = () => {
  const history = useHistory();

  const [checked, setChecked] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);

  const { tree, file, setFile } = useContext(
    WorkbenchContext
  ) as IWorkbenchContext;

  const onSelectFile = ({ children, value }: OnCheckNode) => {
    if (!children && value !== file) {
      history.push(`/workbench/file/${value}`);
      setFile(value);
    }
  };

  return (
    <>
      <CheckboxTree
        nodes={tree || []}
        checked={checked}
        expanded={expanded}
        onClick={(targetNode) => onSelectFile(targetNode)}
        expandOnClick
        onCheck={(checkedItems) => setChecked(checkedItems)}
        onExpand={(expandedItems) => setExpanded(expandedItems)}
      />
    </>
  );
};

export default FileTree;
