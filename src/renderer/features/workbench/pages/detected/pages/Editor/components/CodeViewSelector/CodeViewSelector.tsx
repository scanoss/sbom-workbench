import React from 'react';
import { ButtonGroup, Button, makeStyles, Tooltip } from '@material-ui/core';
import AccountTreeOutlined from '@material-ui/icons/AccountTreeOutlined';
import CodeOutlinedIcon from '@material-ui/icons/CodeOutlined';

const useStyles = makeStyles((theme) => ({
  root: {
    marginBottom: theme.spacing(1),
  },
  button: {
    fontSize: 16,
    minWidth: 32,
  },
}));

const CodeViewSelector = ({ active, setView }) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <ButtonGroup variant="outlined" size="small" aria-label="file view selector">
        <Tooltip title="Raw view" arrow>
          <Button
            className={classes.button}
            onClick={() => setView('code')}
            color={active === 'code' ? 'primary' : 'default'}
            aria-label="code"
          >
            <CodeOutlinedIcon fontSize="inherit" />
          </Button>
        </Tooltip>
        <Tooltip title="Dependency view" arrow>
          <Button
            className={classes.button}
            onClick={() => setView('graph')}
            color={active === 'graph' ? 'primary' : 'default'}
            aria-label="graph"
          >
            <AccountTreeOutlined fontSize="inherit" />
          </Button>
        </Tooltip>
      </ButtonGroup>
    </div>
  );
};

export default CodeViewSelector;
