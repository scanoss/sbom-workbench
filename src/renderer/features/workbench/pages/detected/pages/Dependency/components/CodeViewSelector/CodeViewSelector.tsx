import React from 'react';
import { ButtonGroup, Button, Tooltip, Box } from '@mui/material';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import ExtensionOutlinedIcon from '@mui/icons-material/ExtensionOutlined';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material';

export enum CodeViewSelectorMode {
  CODE,
  GRAPH,
}

const CodeViewSelector = ({ active, setView }) => {
  const theme  = useTheme();
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        marginRight: theme.spacing(1),
      }}
    >
      <ButtonGroup variant="contained" size="small" aria-label="file view selector">
        <Tooltip title={t('Tooltip:RawView')} arrow>
          <Button
            sx={{
              fontSize: 16,
              minWidth: 32,
              '&:not(.MuiButton-containedPrimary)': {
                backgroundColor: '#fff',
                color: '#000',
              },
            }}
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
    </Box>
  );
};

export default CodeViewSelector;
