import React from 'react';
import {
  IconButton,
  Link,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Chip,
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import ReplayIcon from '@material-ui/icons/Replay';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import WarningOutlinedIcon from '@material-ui/icons/WarningOutlined';
import GetAppOutlined from '@material-ui/icons/GetAppOutlined';
import { IProject, ScanState } from '../../../../../api/types';
import AppConfig from '../../../../../config/AppConfigModule';

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
  onProjectClick: (project: IProject) => void;
  onProjectDelete: (project: IProject) => void;
  onProjectRestore: (project: IProject) => void;
  onProjectRescan: (project: IProject) => void;
  onProjectExport: (project: IProject) => void;
  onProjectCreate: () => void;
  onProjectImport: () => void;
}

const ProjectList = (props: ProjectListProps) => {
  const classes = useStyles();

  const { projects, searchQuery } = props;
  const filterProjects = filter(projects, searchQuery);

  return (
    <>
      {projects && projects.length > 0 ? (
        <TableContainer component={Paper}>
          <Table className="projects-table" aria-label="projects table">
            <TableHead>
              <TableRow>
                <TableCell width="50%">NAME</TableCell>
                <TableCell>DATE</TableCell>
                <TableCell>TOTAL FILES</TableCell>
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
                    onClick={() => isProjectFinished(project) && props.onProjectClick(project)}
                  >
                    <TableCell component="th" scope="row">
                      <div className="project-name">
                        {isProjectDeprecated(project) && (
                          <Tooltip
                            classes={{ tooltip: classes.md }}
                            title="This project was scanned with a previous version that is no longer supported."
                          >
                            <WarningOutlinedIcon fontSize="inherit" className="icon mr-1" />
                          </Tooltip>
                        )}
                        <span>{project.name}</span>
                        {isProjectImported(project) && (
                          <Tooltip classes={{ tooltip: classes.md }} title="This project was imported. You will not be able to see the original source code.">
                            <Chip label="IMPORTED" size="small" variant="outlined" className="ml-1" />
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{format(project.date)}</TableCell>
                    <TableCell>{project.files}</TableCell>
                    <TableCell className="row-actions">
                      <div className="btn-actions">
                        {!isProjectFinished(project) && !isProjectDeprecated(project) && (
                          <Tooltip title="Resume scan">
                            <IconButton
                              aria-label="restore"
                              className="btn-restore"
                              onClick={(event) => {
                                event.stopPropagation();
                                props.onProjectRestore(project);
                              }}
                            >
                              <PlayArrowIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {isProjectFinished(project) && !isProjectDeprecated(project) && (
                          <>
                          <Tooltip title="Export project">
                              <IconButton
                                aria-label="export"
                                className="btn-export"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  props.onProjectExport(project);
                                }}
                              >
                                <GetAppOutlined fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Rescan">
                              <IconButton
                                aria-label="rescan"
                                className="btn-rescan"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  props.onProjectRescan(project);
                                }}
                              >
                                <ReplayIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}

                        <Tooltip title="Remove project">
                          <IconButton
                            aria-label="delete"
                            className="btn-delete"
                            onClick={(event) => {
                              event.stopPropagation();
                              props.onProjectDelete(project);
                            }}
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
                      Not projects found with <strong>{searchQuery}</strong>
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ) : !projects ? (
        <p>Loading projects...</p>
      ) : (
        <div className="empty-container">
          <div className="empty-list">
            <h3>No projects found</h3>
            <p>
              You can start by&nbsp;
              <Link onClick={() => props.onProjectCreate()}>scanning a new project</Link><br />or <Link onClick={() => props.onProjectImport()}>importing a project</Link>.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectList;
