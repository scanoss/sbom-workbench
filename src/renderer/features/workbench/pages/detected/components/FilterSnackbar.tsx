import React, { useContext } from 'react';
import { makeStyles, Snackbar } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { WorkbenchContext, IWorkbenchContext } from '@context/WorkbenchProvider';
import FilterIcon from '../../../../../../../assets/imgs/filter-icon.svg';
import { useLocation } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: '520px',
    position: 'absolute',
    bottom: 15,
    transition: 'opacity 0.18s ease-in-out',
    zIndex: 1000,
    '&:hover': {
      opacity: 0.2,
    },
  },
  alert: {
    backgroundColor: 'white',
    color: theme.palette.primary.main,
    border: '1px solid #e0e0e0',
    boxShadow: '0px 1px 3px 0px #0000001A',
  },
}));

const FilterSnackbar = () => {
  const classes = useStyles();
  const curLoc = useLocation();

  const { isFilterActive } = useContext(WorkbenchContext) as IWorkbenchContext;

  // FIXME: create app.routes.ts and set data for each route
  const isShow = isFilterActive && !curLoc.pathname.startsWith('/workbench/detected/file');

  return (
    <Snackbar open={isShow} className={classes.root}>
      <Alert
        severity="info"
        variant="outlined"
        className={classes.alert}
        icon={<img alt="filter icon" src={FilterIcon} />}
      >
        The workspace context is reduced because there are active filters
      </Alert>
    </Snackbar>
  );
};

export default FilterSnackbar;
