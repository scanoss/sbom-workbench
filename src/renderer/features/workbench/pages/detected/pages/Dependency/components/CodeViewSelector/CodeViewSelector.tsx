import React from 'react';
import { ButtonGroup, Button, Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import ExtensionOutlinedIcon from '@mui/icons-material/ExtensionOutlined';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material';

const useStyles = makeStyles((theme) => ({
  root: {
    marginRight: useTheme().spacing(1),
  },
  button: {
    fontSize: 16,
    minWidth: 32,

    '&:not(.MuiButton-containedPrimary)': {
      backgroundColor: '#fff',
      color: '#000',
    },
  },
}));

export enum CodeViewSelectorMode {
  CODE,
  GRAPH,
}

const CodeViewSelector = ({ active, setView }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div className={classes.root}>
      <ButtonGroup variant="contained" size="small" aria-label="file view selector">
        <Tooltip title={t('Tooltip:RawView')} arrow>
          <Button
            className={classes.button}
            onClick={() => setView(CodeViewSelectorMode.CODE)}
            color={active === CodeViewSelectorMode.CODE ? 'primary' : 'secondary'}
            aria-label="code"
          >
            <CodeOutlinedIcon fontSize="inherit" />
          </Button>
        </Tooltip>
        <Tooltip title={t('Tooltip:DependencyView')} arrow>
          <Button
            className={classes.button}
            onClick={() => setView(CodeViewSelectorMode.GRAPH)}
            color={active === CodeViewSelectorMode.GRAPH ? 'primary' : 'secondary'}
            aria-label="graph"
          >
            <ExtensionOutlinedIcon fontSize="inherit" />
          </Button>
        </Tooltip>
      </ButtonGroup>
    </div>
  );
};

export default CodeViewSelector;
