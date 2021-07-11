import React, { useContext, useState } from 'react';
import CheckboxTree, { OnCheckNode } from 'react-checkbox-tree';
import { useHistory } from 'react-router-dom';
import { setFile } from '../../actions';
import { IWorkbenchContext, WorkbenchContext } from '../../store';

export const FileTree = () => {
  const history = useHistory();

  const { state, dispatch } = useContext(WorkbenchContext) as IWorkbenchContext;

  const { tree, file } = state;

  const [checked, setChecked] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string[]>(['/']);

  const onSelectFile = ({ children, value }: OnCheckNode) => {
    if (!children) {
      history.push(`/workbench/file`);
      dispatch(setFile(value));
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
