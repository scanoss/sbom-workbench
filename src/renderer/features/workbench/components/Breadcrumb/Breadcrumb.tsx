import React, { useContext } from 'react';
import AccountTreeOutlinedIcon from '@material-ui/icons/AccountTreeOutlined';
import { Chip } from '@material-ui/core';
import { WorkbenchContext, IWorkbenchContext } from '../../store';
import { setFolder } from '../../actions';

const Breadcrumb = () => {
  const { state, dispatch } = useContext(WorkbenchContext) as IWorkbenchContext;
  return (
    <div className="view d-flex align-center">
      <Chip
        icon={<AccountTreeOutlinedIcon fontSize="inherit" />}
        label={state.filter.node?.path}
        onDelete={() => dispatch(setFolder(null))}
      />
    </div>
  );
};

export default Breadcrumb;
