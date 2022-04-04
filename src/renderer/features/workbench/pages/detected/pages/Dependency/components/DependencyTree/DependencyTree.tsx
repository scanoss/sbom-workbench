import React from 'react';
import { IconButton, ListItem, ListItemIcon, ListItemText, Tooltip } from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';
import BanIcon from '@material-ui/icons/NotInterested';
import { RestoreOutlined } from '@material-ui/icons';
import { List, AutoSizer } from 'react-virtualized';
import IconComponent from '../../../../../../components/IconComponent/IconComponent';
import { Dependency } from '../../../../../../../../../api/types';

interface DependencyTreeProps {
  dependencies: Array<Dependency>;
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
      <AutoSizer style={{ width: '100%', maxHeight: '100%' }}>
        {({ width, height }) => (
          <List
            width={width}
            height={height}
            rowCount={dependencies.length}
            rowHeight={40}
            overscanRowCount={10}
            scrollToAlignment="start"
            rowRenderer={({ index, key, style }) => {
              const item = dependencies[index];
              return (
                <React.Fragment key={key}>
                  <ListItem
                    style={style}
                    className={`
                      ${item.status}
                      ${item.valid ? 'valid' : 'invalid'}
                    `}
                  >
                    <ListItemIcon className="item-icon">
                      <IconComponent name={item.purl.replace(/pkg:.*\//, '')} size={24} />
                    </ListItemIcon>
                    <ListItemText primary={decodeURIComponent(item.purl)} />
                    <div className="license-version-container">
                      <div className="pill-version">
                        <small>{item.version || '-'}</small>
                      </div>
                      <div className="pill-license">
                        <small>{item.licenses[0] || '-'}</small>
                      </div>
                    </div>
                    <div className="item-action-buttons">
                      {item.status === 'pending' && (
                        <>
                          <Tooltip title="Accept">
                            <IconButton size="small" onClick={() => onDependencyAccept(item)}>
                              <CheckIcon className="icon check" fontSize="inherit" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Dismiss">
                            <IconButton size="small" onClick={() => onDependencyReject(item)}>
                              <BanIcon className="icon ban" fontSize="inherit" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      {(item.status === 'original' || item.status === 'identified') && (
                        <>
                          <Tooltip title="Restore">
                            <IconButton size="small" onClick={() => onDependencyRestore(item)}>
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
  );
};

export default DependencyTree;
