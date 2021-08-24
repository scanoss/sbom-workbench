import { Toolbar, IconButton, Typography, Button, createStyles, makeStyles, Theme } from '@material-ui/core';
import React from 'react';
import HomeIcon from '@material-ui/icons/Home';
// eslint-disable-next-line import/no-named-default
import { default as MaterialAppBar } from '@material-ui/core/AppBar';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appbar: {
      backgroundColor: 'white',
      color: 'black',
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
    },
  }),
);
const AppBar = () => {
  const classes = useStyles();

  return (
    <>
      <MaterialAppBar position="static" className={classes.appbar} elevation={1}>
        <Toolbar variant="dense">
          <IconButton edge="start" color="inherit" aria-label="menu">
            <HomeIcon />
          </IconButton>
          <Typography variant="h6">Ansible Test</Typography>
        </Toolbar>
      </MaterialAppBar>
    </>
  );
};

export default AppBar;
