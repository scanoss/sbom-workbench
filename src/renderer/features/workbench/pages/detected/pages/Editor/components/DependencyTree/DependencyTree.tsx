import React from 'react';
import { Divider, List, ListItem, ListItemIcon, ListItemText, Typography } from '@material-ui/core';
import IconComponent from '../../../../../../components/IconComponent/IconComponent';

const DependencyTree = ({ dependencies }) => {
  return (
    <div id="DependencyTree" className="dependencies-tree">
      <div className="dependencies-tree-header mt-1 mb-2">
        <div className="dependencies-tree-header-title">
          <Typography variant="subtitle2">
            <b>{dependencies.length}</b> {dependencies.length > 1 ? 'dependencies' : 'dependency'} found
          </Typography>
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
                <ListItemText primary={dependency.purl} />
                <small>{dependency.version || '-'}</small>
              </ListItem>
              <Divider component="li" variant="middle" />
            </>
          ))}
        </List>
      </div>
    </div>
  );
};

export default DependencyTree;
