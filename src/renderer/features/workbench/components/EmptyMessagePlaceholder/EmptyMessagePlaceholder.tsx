import React from 'react';
import { makeStyles } from '@material-ui/core';
import componentEmpty from '@assets/imgs/component-empty.svg';
import SearchIcon from '@material-ui/icons/Search';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'grid',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  root: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    maxWidth: 300,
    margin: '0 auto',
  },
  message: {
    textAlign: 'center',
    color: '#71717A',
  },
}));

const EmptyMessagePlaceholder = ({ children }) => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <div className={classes.root}>
        <h4 className={classes.message}>{children}</h4>
      </div>
    </div>
  );
};

export default EmptyMessagePlaceholder;
