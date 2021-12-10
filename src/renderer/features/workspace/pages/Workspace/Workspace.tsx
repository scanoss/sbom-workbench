import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { Button, IconButton, InputBase } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

import Paper from '@material-ui/core/Paper';

import SearchIcon from '@material-ui/icons/Search';
import { AppContext, IAppContext } from '../../../../context/AppProvider';
import { IProject } from '../../../../../api/types';
import { workspaceService } from '../../../../../api/workspace-service';
import { DialogContext, IDialogContext } from '../../../../context/DialogProvider';
import { DIALOG_ACTIONS } from '../../../../context/types';
import ProjectList from '../Components/ProjectList';

const Workspace = () => {
  const history = useHistory();

  const { setScanPath, newProject } = useContext(AppContext) as IAppContext;
  const dialogCtrl = useContext(DialogContext) as IDialogContext;

  const [projects, setProjects] = useState<any[] | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const init = async () => {
    try {
      const projects = await workspaceService.getAllProjects();
      setProjects(projects);
    } catch (error) {
      alert(error);
    }
  };

  const cleanup = () => {};

  const onShowScanHandler = (project) => {
    setScanPath({ path: project.work_root, action: 'none' });
    history.push('/workbench');
  };

  const onNewProjectHandler = () => {
    newProject();
  };

  const onTrashHandler = async (project: IProject) => {
    const { action } = await dialogCtrl.openConfirmDialog('Are you sure you want to delete this project?', {
      label: 'Delete',
      role: 'delete',
    });
    if (action === DIALOG_ACTIONS.OK) {
      await workspaceService.deleteProject(project.work_root);
      init();
    }
  };

  const onRescanHandler = async (project: IProject) => {
    const { action } = await dialogCtrl.openConfirmDialog('Are you sure you want to rescan this project?', {
      label: 'OK',
      role: 'accept',
    });
    if (action === DIALOG_ACTIONS.OK) {
      setScanPath({ path: project.work_root, action: 'rescan', projectName: project.name });
      history.push('/workspace/new/scan');
      init();
    }
  };

  const onRestoreHandler = async (project: IProject) => {
    setScanPath({ path: project.work_root, action: 'resume', projectName: project.name });
    history.push('/workspace/new/scan');
  };

  useEffect(() => {
    init();
    return cleanup;
  }, []);

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
            <Button startIcon={<AddIcon />} variant="contained" color="primary" onClick={onNewProjectHandler}>
              New project
            </Button>
          </section>
        </header>
        <main className="app-content">
          <ProjectList
            projects={projects}
            searchQuery={searchQuery}
            onProjectClick={onShowScanHandler}
            onProjectDelete={onTrashHandler}
            onProjectRestore={onRestoreHandler}
            onProjectRescan={onRescanHandler}
            onProjectCreate={onNewProjectHandler}
          />
        </main>
      </section>
    </>
  );
};

export default Workspace;
