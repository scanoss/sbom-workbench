import React from 'react';
import { Divider, IconButton, ListItem, ListItemIcon, ListItemText, Tooltip, Typography } from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';
import BanIcon from '@material-ui/icons/NotInterested';
import { RestoreOutlined } from '@material-ui/icons';
import { List, AutoSizer } from 'react-virtualized';
import IconComponent from '../../../../../../components/IconComponent/IconComponent';

interface DependencyTreeProps {
  dependencies: any[]; // TODO: define type
  onDependencyAccept: (dep: any) => void;
  onDependencyReject: (dep: any) => void;
  onDependencyRestore: (dep: any) => void;
}

const DependencyTree = ({
  dependencies,
  onDependencyAccept,
  onDependencyReject,
  onDependencyRestore,
}: DependencyTreeProps) => {
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
        <AutoSizer style={{ width: '100%', height: '200px' }}>
          {({ width, height }) => (
            <List
              width={width}
              height={height}
              rowCount={dependencies.length}
              rowHeight={40}
              overscanRowCount={10}
              scrollToAlignment="start"
              rowRenderer={({ index, key, style, parent }) => {
                const value = dependencies[index];
                return (
                  <React.Fragment key={value.purl}>
                    <ListItem
                      style={style}
                      className={`
                  ${value.status}
                  ${value.valid ? 'valid' : 'invalid'}
                `}
                    >
                      <ListItemIcon className="item-icon">
                        <IconComponent name={value.purl.replace(/pkg:.*\//, '')} size={24} />
                      </ListItemIcon>
                      <ListItemText primary={decodeURIComponent(value.purl)} />
                      <div className="license-version-container">
                        <div className="pill-version">
                          <small>{value.version || '-'}</small>
                        </div>
                        <div className="pill-license">
                          <small>{value.licenses[0] || '-'}</small>
                        </div>
                      </div>

                      <div className="item-action-buttons">
                        {value.status === 'pending' && value.valid === true && (
                          <>
                            <Tooltip title="Accept">
                              <IconButton size="small" onClick={() => onDependencyAccept(value)}>
                                <CheckIcon className="icon check" fontSize="inherit" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        {value.status === 'pending' && (
                          <>
                            <Tooltip title="Dismiss">
                              <IconButton size="small" onClick={() => onDependencyReject(value)}>
                                <BanIcon className="icon ban" fontSize="inherit" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        {(value.status === 'original' || value.status === 'identified') && (
                          <>
                            <Tooltip title="Restore">
                              <IconButton size="small" onClick={() => onDependencyRestore(value)}>
                                <RestoreOutlined className="icon" fontSize="inherit" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </div>
                    </ListItem>
                    {/* <Divider/> */}
                  </React.Fragment>
                );
              }}
            />
          )}
        </AutoSizer>
      </div>
    </div>
  );
};

export default DependencyTree;
