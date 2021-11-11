import React, { useContext, useState } from 'react';
import CheckboxTree, { OnCheckNode } from 'react-checkbox-tree';
import { useHistory } from 'react-router-dom';
import { IWorkbenchContext, WorkbenchContext } from '../../store';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import FolderOpenIcon from '../FolderOpenIcon/FolderOpenIcon';
import FolderIcon from '../FolderIcon/FolderIcon';
import FileIcon from '../FileIcon/FileIcon';

export const FileTree = () => {
  const history = useHistory();

  const { state } = useContext(WorkbenchContext) as IWorkbenchContext;

  const { tree } = state;

  const aTree = [tree];

  const [expanded, setExpanded] = useState<string[]>([
    aTree && aTree[0] ? aTree[0].value : '',
  ]);

  const onSelectFile = ({ children, value }: OnCheckNode) => {
    if (!children) {
      history.push(
        `/workbench/detected/file?path=${encodeURIComponent(value)}`
      );
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
          icons={{
            expandClose: <KeyboardArrowRightIcon />,
            expandOpen: <KeyboardArrowDownIcon />,
            parentClose: <FolderIcon width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" />,
            parentOpen: <FolderOpenIcon width="21" height="18" viewBox="0 0 21 18" fill="none" xmlns="http://www.w3.org/2000/svg" />,
            leaf: <FileIcon width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg"/>,
          }}
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
