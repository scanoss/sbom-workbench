import React from 'react';
import { Paper, Tab, Tabs } from '@mui/material';
import { useTranslation } from 'react-i18next';

export enum DependencyStatus {
  IDENTIFIED = 'identified',
  PENDING = 'pending',
  ORIGINAL = 'original',
}

const TabNavigation = ({ tab, onChange }) => {
  const { t } = useTranslation();
  return (
    <div className="tabs d-flex">
      <Paper square>
        <Tabs
          selectionFollowsFocus
          value={tab}
          TabIndicatorProps={{ style: { display: 'none' } }}
          onChange={(tab, value) => onChange(value)}
        >
          <Tab label={t('Title:All')} value={null} />
          <Tab label={t('Title:Pending')} value={DependencyStatus.PENDING} className={`has-bullet ${DependencyStatus.PENDING}`} />
          <Tab label={t('Title:Identified')} value={DependencyStatus.IDENTIFIED} className={`has-bullet ${DependencyStatus.IDENTIFIED}`} />
          <Tab label={t('Title:Dismissed')} value={DependencyStatus.ORIGINAL} className={`has-bullet ${DependencyStatus.ORIGINAL}`} />
        </Tabs>
      </Paper>
    </div>
  );
};

export default TabNavigation;
