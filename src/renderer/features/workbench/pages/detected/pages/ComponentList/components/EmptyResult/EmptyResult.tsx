import React from 'react';
import { makeStyles } from '@mui/styles';
import componentEmpty from '@assets/imgs/component-empty.svg';

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
    width: 300,
    margin: '0 auto 80px',
  },
  message: {
    textAlign: 'center',
    color: '#71717A',
  },
}));

const EmptyResult = ({ children }) => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <div className={classes.root}>
        <img src={componentEmpty} alt="components empty icon" />
        <h3 className={classes.message}>{children}</h3>
      </div>
    </div>
  );
};

export default EmptyResult;
