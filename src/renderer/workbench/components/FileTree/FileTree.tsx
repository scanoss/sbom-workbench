import React, { Children, useContext, useState } from 'react';
import CheckboxTree, { OnCheckNode } from 'react-checkbox-tree';
import { IWorkbenchContext, WorkbenchContext } from '../../WorkbenchProvider';

const nodes = [
  {
    value: 'mars',
    label: 'Mars',
    children: [
      { value: 'phobos', label: 'Phobos' },
      { value: 'deimos', label: 'Deimos' },
    ],
  },
];

export const FileTree = () => {
  const [checked, setChecked] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);

  const { tree, setFile } = useContext(WorkbenchContext) as IWorkbenchContext;

  const onSelectFile = (target: OnCheckNode) => {
    if (!target.children || target.children.length === 0) {
      setFile(target.value);
    }
  };

  return (
    <>
      <CheckboxTree
        nodes={tree || []}
        checked={checked}
        expanded={expanded}
        onClick={(targetNode) => onSelectFile(targetNode)}
        onCheck={(checkedItems) => setChecked(checkedItems)}
        onExpand={(expandedItems) => setExpanded(expandedItems)}
      />
    </>
  );
};

export default FileTree;
