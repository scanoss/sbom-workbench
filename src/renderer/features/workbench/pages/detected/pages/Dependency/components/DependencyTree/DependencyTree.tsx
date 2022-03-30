import React from 'react';
import {
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';
import BanIcon from '@material-ui/icons/NotInterested';
import IconComponent from '../../../../../../components/IconComponent/IconComponent';

interface DependencyTreeProps {
  dependencies: any[]; // TODO: define type
  onDependencyAccept: (dep: any) => void;
  onDependencyReject: (dep: any) => void;
};

const DependencyTree = ({ dependencies, onDependencyAccept, onDependencyReject }: DependencyTreeProps) => {
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
              <ListItem
                className={`
                  ${dependency.status}
                  ${dependency.valid ? 'valid' : 'invalid'}
                `}
              >
                <ListItemIcon className="item-icon">
                  <IconComponent name={dependency.purl.replace(/pkg:.*\//, '')} size={24} />
                </ListItemIcon>
                <ListItemText primary={decodeURIComponent(dependency.purl)} />
                <div className="ml-1">
                  <small>{dependency.version || '-'}</small>
                </div>

                <div className="item-action-buttons">
                  {dependency.status === 'pending' && (
                    <>
                      <Tooltip title="Accept">
                        <IconButton size="small" onClick={() => onDependencyAccept(dependency)}>
                          <CheckIcon className="icon check" fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Dismiss">
                        <IconButton size="small" onClick={() => onDependencyReject(dependency)}>
                          <BanIcon className="icon ban" fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                  {dependency.status === 'ignored' && (
                    <>
                      <Tooltip title="Accept">
                        <IconButton size="small" onClick={() => onDependencyAccept(dependency)}>
                          <CheckIcon className="icon check" fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                  {dependency.status === 'identified' && (
                    <>
                      <Tooltip title="Dismiss">
                        <IconButton size="small" onClick={() => onDependencyReject(dependency)}>
                          <BanIcon className="icon ban" fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
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
