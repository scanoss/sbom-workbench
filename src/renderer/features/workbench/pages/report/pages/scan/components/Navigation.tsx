import react from 'react';

import { Button, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
  tooltip: {
    textAlign: 'center',
    fontSize: '.75rem',
    maxWidth: 140,
  },
});

export const NavigationTabs = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <section className="nav">
      <NavLink to="detected" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} tabIndex={-1}>
        <Tooltip
          title={t('Tooltip:SBOMDetectedHelp')}
          classes={{ tooltip: classes.tooltip }}
        >
          <Button size="large">{t('Button:Detected')}</Button>
        </Tooltip>
      </NavLink>
      <NavLink to="identified" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} tabIndex={-1}>
        <Tooltip
          title={t('Tooltip:SBOMIdentifiedHelp')}
          classes={{ tooltip: classes.tooltip }}
        >
          <Button size="large">{t('Button:Identified')}</Button>
        </Tooltip>
      </NavLink>
    </section>
  );
};
