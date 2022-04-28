import { Paper, Tab, Tabs } from '@material-ui/core';
import React from 'react';

export enum DependencyStatus {
  IDENTIFIED = 'identified',
  PENDING = 'pending',
  ORIGINAL = 'original',
}

const TabNavigation = ({ tab, onChange }) => {
  return (
    <div className="tabs d-flex">
      <Paper square>
        <Tabs
          selectionFollowsFocus
          value={tab}
          TabIndicatorProps={{ style: { display: 'none' } }}
          onChange={(tab, value) => onChange(value)}
        >
          <Tab label="All" value={null} />
          <Tab label="Pending" value={DependencyStatus.PENDING} className={`has-bullet ${DependencyStatus.PENDING}`} />
          <Tab label="Identified" value={DependencyStatus.IDENTIFIED} className={`has-bullet ${DependencyStatus.IDENTIFIED}`} />
          <Tab label="Dismissed" value={DependencyStatus.ORIGINAL} className={`has-bullet ${DependencyStatus.ORIGINAL}`} />
        </Tabs>
      </Paper>
    </div>
  );
};

export default TabNavigation;
