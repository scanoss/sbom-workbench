import React, { useContext, useState } from 'react';
import CheckboxTree, { OnCheckNode } from 'react-checkbox-tree';
import { useHistory } from 'react-router-dom';
import { IWorkbenchContext, WorkbenchContext } from '../../store';

export const FileTree = () => {
  const history = useHistory();

  const { state } = useContext(WorkbenchContext) as IWorkbenchContext;

  const { tree } = state;

  const aTree = [tree];

  const [expanded, setExpanded] = useState<string[]>([aTree && aTree[0] ? aTree[0].value : '']);

  const onSelectFile = ({ children, value }: OnCheckNode) => {
    if (!children) {
      history.push(`/workbench/detected/file?path=${encodeURIComponent(value)}`);
    }
  };

  return (
    <>
      {tree ? (
        <CheckboxTree
          nodes={aTree || []}
          expanded={expanded}
          onClick={(targetNode) => onSelectFile(targetNode)}
          expandOnClick
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
