import React from 'react';
import { Snackbar } from '@mui/material';
import Alert from '@mui/material/Alert';
import { useLocation } from 'react-router-dom';
import { selectNavigationState } from '@store/navigation-store/navigationSlice';
import { useSelector } from 'react-redux';
import FilterIcon from '@assets/imgs/filter-icon.svg';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material';


const FilterSnackbar = () => {
  const curLoc = useLocation();
  const { t } = useTranslation();
  const theme = useTheme();

  const { isFilterActive } = useSelector(selectNavigationState);

  // FIXME: create app.routes.ts and set data for each route
  const isShow = isFilterActive && !curLoc.pathname.startsWith('/workbench/detected/file');

  return (
    <Snackbar
      open={isShow}
      sx={{
        minWidth: '520px',
        position: 'absolute',
        bottom: 15,
        transition: 'opacity 0.18s ease-in-out',
        zIndex: 1000,
        '&:hover': {
          opacity: 0.2,
        },
        left: '70%',
      }}
    >
      <Alert
        severity="info"
        variant="outlined"
        sx={{
          backgroundColor: 'white',
          color: theme.palette.primary.main,
          border: '1px solid #e0e0e0',
          boxShadow: '0px 1px 3px 0px #0000001A',
        }}
        icon={<img alt="filter icon" src={FilterIcon} />}
      >
        {t('WorkspaceIsReduced')}
      </Alert>
    </Snackbar>
  );
};

export default FilterSnackbar;
