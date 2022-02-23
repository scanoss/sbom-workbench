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
            <React.Fragment key={dependency.purl}>
              <ListItem>
                <ListItemIcon>
                  <IconComponent name={dependency.purl.replace(/pkg:.*\//, '')} size={24} />
                </ListItemIcon>
                <ListItemText primary={decodeURIComponent(dependency.purl)} />
                <div className="ml-1">
                  <small>{dependency.version || '-'}</small>
                </div>
              </ListItem>
              <Divider component="li" variant="middle" />
            </React.Fragment>
          ))}
        </List>
      </div>
    </div>
  );
};

export default DependencyTree;
