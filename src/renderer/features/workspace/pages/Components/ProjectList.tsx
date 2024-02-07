/* eslint-disable react/destructuring-assignment */
import React from 'react';
import {
  IconButton,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Chip,
} from '@mui/material';
import { makeStyles } from '@mui/styles';

import { IProject, ProjectAccessMode, ScanState } from '@api/types';
import { Trans, useTranslation } from 'react-i18next';
import AppConfig from '../../../../../config/AppConfigModule';

/* icons */
import EditOffIcon from '@mui/icons-material/EditOff';
import GetAppOutlined from '@mui/icons-material/GetAppOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import ReplayIcon from '@mui/icons-material/Replay';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import WarningOutlinedIcon from '@mui/icons-material/WarningOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';

const filter = (items, query) => {
  if (!items) return null;

  const result = items.filter((item) => {
    const name = item.name.toLowerCase();
    return name.includes(query.toLowerCase());
  });

  return result;
};

const format = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const useStyles = makeStyles((theme) => ({
  md: {
    maxWidth: 130,
    textAlign: 'center',
  },
}));

const isProjectFinished = (project: IProject): boolean => project.scannerState === ScanState.FINISHED;
const isProjectDeprecated = (project: IProject): boolean => project.appVersion < AppConfig.MIN_VERSION_SUPPORTED;
const isProjectImported = (project: IProject): boolean => project.source === 'IMPORTED';

interface ProjectListProps {
  projects: IProject[];
  searchQuery: string;
  onProjectClick: (project: IProject, mode: ProjectAccessMode) => void;
  onProjectDelete: (project: IProject) => void;
  onProjectRestore: (project: IProject) => void;
  onProjectRescan: (project: IProject) => void;
  onProjectExport: (project: IProject) => void;
  onProjectCreate: () => void;
  onProjectImport: () => void;
}

const ProjectList = (props: ProjectListProps) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { projects, searchQuery } = props;
  const filterProjects = filter(projects, searchQuery);

  return (
    <>
      {projects && projects.length > 0 ? (
        <TableContainer component={Paper}>
          <Table className="projects-table" aria-label="projects table">
            <TableHead>
              <TableRow>
                <TableCell width="50%">{t('Table:Header:Name')}</TableCell>
                <TableCell>{t('Table:Header:Date')}</TableCell>
                <TableCell>{t('Table:Header:TotalFiles')}</TableCell>
                <TableCell width={30} />
              </TableRow>
            </TableHead>
            <TableBody>
              {filterProjects.length !== 0 ? (
                filterProjects.map((project) => (
                  <TableRow
                    className={`
                    ${isProjectFinished(project) ? 'scanning-complete' : 'scanning-not-complete'}
                    ${isProjectDeprecated(project) ? 'project-deprecated' : ''}
                    `}
                    hover
                    key={project.name}
                    onClick={() => isProjectFinished(project) && props.onProjectClick(project, ProjectAccessMode.WRITE)}
                  >
                    <TableCell component="th" scope="row">
                      <div className="project-name">
                        {isProjectDeprecated(project) && (
                          <Tooltip
                            classes={{ tooltip: classes.md }}
                            title={t('Tooltip:ProjectDeprecated')}
                          >
                            <WarningOutlinedIcon fontSize="inherit" className="icon mr-1" />
                          </Tooltip>
                        )}
                        <span>{project.name}</span>
                        {isProjectImported(project) && (
                          <Tooltip
                            classes={{ tooltip: classes.md }}
                            title={t('Tooltip:ProjectImported')}
                          >
                            <Chip label={t('Common:IMPORTED')} size="small" variant="outlined" className="ml-1" />
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{format(project.date)}</TableCell>
                    <TableCell>{project.files}</TableCell>
                    <TableCell className="row-actions">
                      <div className="btn-actions">
                        {!isProjectFinished(project) && !isProjectDeprecated(project) && (
                          <Tooltip title={t('Tooltip:ResumeScan')}>
                            <IconButton
                              aria-label="restore"
                              className="btn-restore"
                              onClick={(event) => {
                                event.stopPropagation();
                                props.onProjectRestore(project);
                              }}
                              size="large"
                            >
                              <PlayArrowIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {isProjectFinished(project) && !isProjectDeprecated(project) && (
                          <>
                            <Tooltip title={t('Tooltip:OpenInReadMode')}>
                              <IconButton
                                aria-label="read-only-mode"
                                className="btn-read-only"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  props.onProjectClick(project, ProjectAccessMode.READ_ONLY);
                                }}
                                size="large"
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title={t('Tooltip:ExportProject')}>
                              <IconButton
                                aria-label="export"
                                className="btn-export"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  props.onProjectExport(project);
                                }}
                                size="large"
                              >
                                <GetAppOutlined fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title={t('Tooltip:Rescan')}>
                              <IconButton
                                aria-label="rescan"
                                className="btn-rescan"
                                disabled={project.source === 'IMPORTED'}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  props.onProjectRescan(project);
                                }}
                                size="large"
                              >
                                <ReplayIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}

                        <Tooltip title={t('Tooltip:RemoveProject')}>
                          <IconButton
                            aria-label="delete"
                            className="btn-delete"
                            onClick={(event) => {
                              event.stopPropagation();
                              props.onProjectDelete(project);
                            }}
                            size="large"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4}>
                    <p className="text-center">
                      <Trans
                        i18nKey="Common:NoProjectsFoundWith"
                        components={{
                          strong: <strong/>,
                        }}
                        values={{ searchQuery }}
                      />
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ) : !projects ? (
        <p>{t('Common:LoadingProjects')}</p>
      ) : (
        <div className="empty-container">
          <div className="empty-list">
            <h3>{t('Common:NoProjectsFound')}</h3>
            <p>
              <Trans
                i18nKey="Common:StartNewProject"
                components={{
                  link1: <Link onClick={() => props.onProjectCreate()} underline="hover" />,
                  link2: <Link onClick={() => props.onProjectImport()} underline="hover" />
                }}
                />
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectList;
