import React from 'react';
import { Card, IconButton, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import BanIcon from '@mui/icons-material/NotInterested';
import { RestoreOutlined } from '@mui/icons-material';
import { List, AutoSizer } from 'react-virtualized';
import WarningOutlinedIcon from '@mui/icons-material/WarningOutlined';
import { Dependency } from '@api/types';
import IconComponent from '../../../../../../components/IconComponent/IconComponent';

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
    <Card elevation={1} id="DependencyTree" className="dependencies-tree">
      <AutoSizer style={{ width: '100%', maxHeight: '100%' }}>
        {({ width, height }) => (
          <List
            width={width}
            height={height}
            rowCount={dependencies.length}
            rowHeight={56}
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

                    <ListItemText
                      primary={item.component?.name || item.componentName || item.purl}
                      secondary={item.purl}
                    />

                    <div className="info-container version">
                      {item.version ? (
                        <>
                          <Typography variant="subtitle1">Version</Typography>
                          <div className="pill-version">
                            <small>{item.version}</small>
                          </div>
                        </>
                      ) : (
                        <div title="No version found" className="d-flex align-center">
                          <Typography variant="subtitle1">Version</Typography>
                          <WarningOutlinedIcon fontSize="inherit" className="icon ml-1" />
                        </div>
                      )}
                    </div>

                    <div className="info-container license">
                      {item.licenses && item.licenses.length > 0 ? (
                        <>
                          <Typography variant="subtitle1">License</Typography>
                          <div className="pill-license">
                            <small>{item.licenses[0]}</small>
                          </div>
                        </>
                      ) : (
                        <div title="No license found" className="d-flex align-center">
                          <Typography variant="subtitle1">License</Typography>
                          <WarningOutlinedIcon fontSize="inherit" className="icon ml-1" />
                        </div>
                      )}
                    </div>

                    <div className="item-action-buttons">
                      {item.status === 'pending' && (
                        <>
                          <IconButton title="Accept" onClick={() => onDependencyAccept(item)} size="large">
                            <CheckIcon className="icon check" fontSize="inherit" />
                          </IconButton>
                          <IconButton title="Dismiss" onClick={() => onDependencyReject(item)} size="large">
                            <BanIcon className="icon ban" fontSize="inherit" />
                          </IconButton>
                        </>
                      )}
                      {(item.status === 'original' || item.status === 'identified') && (
                        <>
                          <IconButton title="Restore" onClick={() => onDependencyRestore(item)} size="large">
                            <RestoreOutlined className="icon" fontSize="inherit" />
                          </IconButton>
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
    </Card>
  );
};

export default DependencyTree;
