import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { Button, IconButton, InputBase, Link, Tooltip } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import DeleteIcon from '@material-ui/icons/Delete';
import RestoreIcon from '@material-ui/icons/Restore';

import { makeStyles } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';

import { ResponseStatus } from '../../../main/Response';
import { AppContext } from '../../../../context/AppProvider';
import { IProject, ScanState } from '../../../../../api/types';
import { workspaceService } from '../../../../../api/workspace-service';
import { DialogContext, IDialogContext } from '../../../../context/DialogProvider';
import { DIALOG_ACTIONS } from '../../../../context/types';

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

const Workspace = () => {
  const history = useHistory();

  const { setScanPath, newProject } = useContext<any>(AppContext);
  const dialogCtrl = useContext(DialogContext) as IDialogContext;

  const [projects, setProjects] = useState<any[] | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const filterProjects = filter(projects, searchQuery);

  const init = async () => {
    try {
      const projects = await workspaceService.getAllProjects();
      setProjects(projects.filter((item) => item.appVersion));
    } catch (error) {
      alert(error);
    }
  };

  const cleanup = () => {};

  const onShowScan = (project) => {
    if (isProjectFinished(project)) {
      setScanPath({ path: project.work_root, action: 'none' });
      history.push('/workbench');
    }
  };

  const onNewProject = () => {
    newProject();
  };

  const onTrashHandler = async (path, e) => {
    e.stopPropagation();
    const { action } = await dialogCtrl.openConfirmDialog('Are you sure you want to delete this project?', {
      label: 'Delete',
      role: 'delete',
    });
    if (action === DIALOG_ACTIONS.OK) {
      await workspaceService.deleteProject(path);
      init();
    }
  };

  const onRestoreHandler = async (path, e) => {
    e.stopPropagation();
    setScanPath({ path, action: 'resume' });
    history.push('/workspace/new');
  };

  useEffect(() => {
    init();
    return cleanup;
  }, []);

  const isProjectFinished = (project: IProject): boolean => {
    return project.scannerState === ScanState.SCANNED || !project.scannerState;
  };

  return (
    <>
      <section id="Workspace" className="app-page">
        <header className="app-header">
          <h1 className="header-title">Projects</h1>
          <section className="subheader">
            <div>
              {projects && projects.length > 0 && (
                <Paper>
                  <IconButton>
                    <SearchIcon />
                  </IconButton>
                  <InputBase
                    className="search-input"
                    onKeyUp={(e: any) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    inputProps={{ 'aria-label': 'search', maxLength: 20 }}
                  />
                </Paper>
              )}
            </div>
            <Button startIcon={<AddIcon />} variant="contained" color="primary" onClick={onNewProject}>
              New project
            </Button>
          </section>
        </header>
        <main className="app-content">
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
                    filterProjects.map((row) => (
                      <TableRow
                        className={isProjectFinished(row) ? 'scanning-complete' : 'scanning-not-complete'}
                        hover
                        key={row.name}
                        onClick={() => {
                          onShowScan(row);
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {row.name}
                        </TableCell>
                        <TableCell>{format(row.date)}</TableCell>
                        <TableCell>{row.files}</TableCell>
                        <TableCell className="row-actions">
                          <div className="btn-actions">
                            {!isProjectFinished(row) ? (
                              <Tooltip title="Resume scan">
                                <IconButton
                                  aria-label="restore"
                                  className="btn-restore"
                                  onClick={(event) => onRestoreHandler(row.work_root, event)}
                                >
                                  <RestoreIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            ) : null}

                            <Tooltip title="Remove project">
                              <IconButton
                                aria-label="delete"
                                className="btn-delete"
                                onClick={(event) => onTrashHandler(row.work_root, event)}
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
                  <Link onClick={onNewProject}>creating a new project</Link>.
                </p>
              </div>
            </div>
          )}
        </main>
      </section>
    </>
  );
};

export default Workspace;
