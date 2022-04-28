import React from 'react';
import { Paper, Tabs, Tab } from '@material-ui/core';
import { ComponentGroup } from '../../../../../../../../../api/types';

export interface TabNavigationProps {
  tab: number;
  component: ComponentGroup;
  version: string;
  query: string;
  filterFiles: any;
  onSelect: (tab: number) => void;
}

const TabNavigation = ({ tab, version, query, component, filterFiles, onSelect }: TabNavigationProps) => {
  return (
    <div className="tabs d-flex">
      <Paper square>
        <Tabs
          selectionFollowsFocus
          value={tab}
          TabIndicatorProps={{ style: { display: 'none' } }}
          onChange={(event, value) => onSelect(value)}
        >
          <Tab label={`Pending (${version || (query && filterFiles.pending.length !== component?.summary.pending) ?`${filterFiles.pending.length}/` : ''}${component?.summary.pending})`} className="has-bullet pending"/>
          <Tab
            label={`Identified (${version || (query && filterFiles.identified.length !== component?.summary.identified) ? `${filterFiles.identified.length}/` : ''}${component?.summary.identified})`}
            className="has-bullet identified"
          />
          <Tab label={`Original (${version || (query && filterFiles.ignored.length !== component?.summary.ignored) ? `${filterFiles.ignored.length}/` : ''}${component?.summary.ignored})`} className="has-bullet ignored"/>
        </Tabs>
      </Paper>
    </div>
  );
};

export default TabNavigation;
