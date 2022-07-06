import React from 'react';
import { makeStyles, Snackbar } from '@mui/material';
import { Alert } from '@mui/lab';
import { useLocation } from 'react-router-dom';
import { selectNavigationState } from '@store/navigation-store/navigationSlice';
import { useSelector } from 'react-redux';
import FilterIcon from '@assets/imgs/filter-icon.svg';

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

  const { isFilterActive } = useSelector(selectNavigationState);

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
