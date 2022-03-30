import React from 'react';
import { ButtonGroup, Button, makeStyles, Tooltip } from '@material-ui/core';
import AccountTreeOutlined from '@material-ui/icons/AccountTreeOutlined';
import CodeOutlinedIcon from '@material-ui/icons/CodeOutlined';

const useStyles = makeStyles((theme) => ({
  root: {
    marginRight: theme.spacing(1),
  },
  button: {
    fontSize: 16,
    minWidth: 32,
  },
}));

export enum CodeViewSelectorMode {
  CODE,
  GRAPH,
}

const CodeViewSelector = ({ active, setView }) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <ButtonGroup variant="outlined" size="small" aria-label="file view selector">
        <Tooltip title="Raw view" arrow>
          <Button
            className={classes.button}
            onClick={() => setView(CodeViewSelectorMode.CODE)}
            color={active === CodeViewSelectorMode.CODE ? 'primary' : 'default'}
            aria-label="code"
          >
            <CodeOutlinedIcon fontSize="inherit" />
          </Button>
        </Tooltip>
        <Tooltip title="Dependency view" arrow>
          <Button
            className={classes.button}
            onClick={() => setView(CodeViewSelectorMode.GRAPH)}
            color={active === CodeViewSelectorMode.GRAPH ? 'primary' : 'default'}
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
