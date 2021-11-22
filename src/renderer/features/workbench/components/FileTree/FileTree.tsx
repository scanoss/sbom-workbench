import React, { useContext, useState, useEffect } from 'react';
import CheckboxTree, { OnCheckNode } from 'react-checkbox-tree';
import { useHistory } from 'react-router-dom';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { componentService } from '../../../../../api/component-service';
import { ComponentSource } from '../../../../../main/db/scan_component_db';
import { setFolder } from '../../actions';
import { IWorkbenchContext, WorkbenchContext } from '../../store';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import FolderOpenIcon from '../FolderOpenIcon/FolderOpenIcon';
import FolderIcon from '../FolderIcon/FolderIcon';
import FileIcon from '../FileIcon/FileIcon';

export const FileTree = () => {
  const history = useHistory();

  const { state, dispatch } = useContext(WorkbenchContext) as IWorkbenchContext;

  const { tree, filter, file } = state;

  const [aTree, setAtree] = useState([]);

  const [expanded, setExpanded] = useState<string[]>([
    aTree && aTree[0] ? aTree[0].value : '',
  ]);

  const onSelectFile = async (node: OnCheckNode) => {
    const { children, value } = node;

    const fileTreeNode = getNode(node);

    if (!children) {
      dispatch(setFolder(null));
      history.push(`/workbench/detected/file?path=${encodeURIComponent(value)}`);
    } else {
      dispatch(setFolder(fileTreeNode || null));
      history.push(`/workbench/detected`);
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
          icons={{
            expandClose: <KeyboardArrowRightIcon />,
            expandOpen: <KeyboardArrowDownIcon />,
            parentClose: <FolderIcon width="18" height="18" viewBox="0 0 18 18" />,
            parentOpen: <FolderOpenIcon width="18" height="18" viewBox="0 0 18 18" />,
            leaf: <FileIcon width="14" height="18" viewBox="0 0 14 18" />,
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
