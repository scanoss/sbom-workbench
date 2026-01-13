import React from 'react';
import {
  Card, IconButton, ListItem, ListItemIcon, ListItemText, Tooltip, Typography,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import BanIcon from '@mui/icons-material/NotInterested';
import { OpenInNew, RestoreOutlined } from '@mui/icons-material';
import { List, AutoSizer } from 'react-virtualized';
import WarningOutlinedIcon from '@mui/icons-material/WarningOutlined';
import { Dependency } from '@api/types';
import { useTranslation } from 'react-i18next';
import IconComponent from '../../../../../../components/IconComponent/IconComponent';
import useMode from '@hooks/useMode';

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
  const { t } = useTranslation();
  const { props } = useMode();

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
                      primary={
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          {item.component?.name || item.componentName || item.purl}
                          {item?.url && (
                            <Tooltip title={item.url}>
                              <IconButton
                                size="small"
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                component="a"
                                sx={{ padding: 0.25 }}
                              >
                                <OpenInNew sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </span>
                      }
                      secondary={item.purl}
                      slotProps={{ secondary: { sx: { userSelect: 'text', cursor: 'text' } } }}
                    />

                    <div className="info-container version">
                      {item.version ? (
                        <>
                          <Typography variant="subtitle1">{t('Table:Version')}</Typography>
                          <div className="pill-version">
                            <small>{item.version}</small>
                          </div>
                        </>
                      ) : (
                        <div title={t('Tooltip:NoVersionFound')} className="d-flex align-center">
                          <Typography variant="subtitle1">{t('Table:Version')}</Typography>
                          <WarningOutlinedIcon fontSize="inherit" className="icon ml-1" />
                        </div>
                      )}
                    </div>

                    <div className="info-container license">
                      {item.licenses && item.licenses.length > 0 ? (
                        <>
                          <Typography variant="subtitle1">{t('Table:License')}</Typography>
                          <div className="pill-license">
                            <small>{item.licenses[0]}</small>
                          </div>
                        </>
                      ) : (
                        <div title={t('Tooltip:NoLicenseFound')} className="d-flex align-center">
                          <Typography variant="subtitle1">{t('Table:License')}</Typography>
                          <WarningOutlinedIcon fontSize="inherit" className="icon ml-1" />
                        </div>
                      )}
                    </div>

                    <div className="info-container scope">
                        <Typography variant="subtitle1">{t('Table:Scope')}</Typography>
                        <div className="pill-scope">
                          <small>{item.scope || '-'}</small>
                        </div>
                    </div>

                    <div className="item-action-buttons">
                      {item.status === 'pending' && (
                        <>
                          <IconButton data-write {...props} title={t('Tooltip:Accept')} onClick={() => onDependencyAccept(item)} size="large">
                            <CheckIcon className="icon check" fontSize="inherit" />
                          </IconButton>
                          <IconButton data-write {...props} title={t('Tooltip:Dismiss')} onClick={() => onDependencyReject(item)} size="large">
                            <BanIcon className="icon ban" fontSize="inherit" />
                          </IconButton>
                        </>
                      )}
                      {(item.status === 'original' || item.status === 'identified') && (
                        <IconButton data-write {...props} title={t('Tooltip:Restore')} onClick={() => onDependencyRestore(item)} size="large">
                          <RestoreOutlined className="icon" fontSize="inherit" />
                        </IconButton>
                      )}
                    </div>
                  </ListItem>
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
