import React, { useState } from 'react';
import CheckboxTree from 'react-checkbox-tree';

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

  return (
    <CheckboxTree
      nodes={nodes}
      checked={checked}
      expanded={expanded}
      onCheck={(checkedItems) => setChecked(checkedItems)}
      onExpand={(expandedItems) => setExpanded(expandedItems)}
    />
  );
};

export default FileTree;
