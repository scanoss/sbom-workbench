import React from 'react';
import { Divider, List, ListItem, ListItemIcon, ListItemText, Typography } from '@material-ui/core';
import IconComponent from '../../../../../../components/IconComponent/IconComponent';

const DependenciesTree = ({ dependencies }) => {
  return (
    <div className="dependencies-tree">
      <div className="dependencies-tree-header">
        <div className="dependencies-tree-header-title">
          <Typography variant="h6">Dependencies</Typography>
        </div>
      </div>
      <div className="dependencies-tree-content">
        <List style={{ width: '100%', backgroundColor: 'white' }}>
          {dependencies.map((dependency) => (
            <>
              <ListItem key={dependency.purl}>
                <ListItemIcon>
                  <IconComponent name={dependency.component} size={24} />
                </ListItemIcon>
                <ListItemText primary={dependency.purl} secondary={dependency.version} />
              </ListItem>
              <Divider component="li" variant="middle" />
            </>
          ))}
        </List>
      </div>
    </div>
  );
};

export default DependenciesTree;
