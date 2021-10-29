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
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import RestoreIcon from '@material-ui/icons/Restore';
import ReplayIcon from '@material-ui/icons/Replay';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import { IProject, ScanState } from '../../../../../api/types';


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

const isProjectFinished = (project: IProject): boolean => {
  return project.scannerState === ScanState.FINISHED || !project.scannerState;
};

interface ProjectListProps {
  projects: IProject[];
  searchQuery: string;
  onProjectClick: (project: IProject) => void;
  onProjectDelete: (project: IProject) => void;
  onProjectRestore: (project: IProject) => void;
  onProjectRescan: (project: IProject) => void;
  onProjectCreate: () => void;
}

const ProjectList = (props: ProjectListProps) => {
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
                    className={isProjectFinished(project) ? 'scanning-complete' : 'scanning-not-complete'}
                    hover
                    key={project.name}
                    onClick={() => isProjectFinished(project) && props.onProjectClick(project)}
                  >
                    <TableCell component="th" scope="row">
                      {project.name}
                    </TableCell>
                    <TableCell>{format(project.date)}</TableCell>
                    <TableCell>{project.files}</TableCell>
                    <TableCell className="row-actions">
                      <div className="btn-actions">
                        {!isProjectFinished(project) ? (
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
                        ) : null}

                        {isProjectFinished(project) ? (
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
                        ) : null}

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
              You can start scanning by&nbsp;
              <Link onClick={() => props.onProjectCreate()}>creating a new project</Link>.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectList;
