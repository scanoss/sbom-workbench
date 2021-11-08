import React, { useContext, useState } from 'react';
import CheckboxTree, { OnCheckNode } from 'react-checkbox-tree';
import { useHistory } from 'react-router-dom';
import { IWorkbenchContext, WorkbenchContext } from '../../store';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import SvgIcon from '@material-ui/core/SvgIcon';
import fileLogo from '../../../../../../assets/imgs/file.svg';
import parentClose from '../../../../../../assets/imgs/folder.svg';
import parentOpen from '../../../../../../assets/imgs/folder-open.svg';

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
            parentClose: (
              <SvgIcon component="object">
                <img src={parentClose} alt="" />
              </SvgIcon>
            ),
            parentOpen: (
              <SvgIcon component="object">
                  <img src={parentOpen} alt="" />
              </SvgIcon>
            ),
            leaf: (
              <SvgIcon component="object">
                <img src={fileLogo} alt="" />
              </SvgIcon>
            ),
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
