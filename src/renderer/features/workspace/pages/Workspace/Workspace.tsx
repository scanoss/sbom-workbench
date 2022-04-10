import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { AppContext, IAppContext } from '@context/AppProvider';
import { IProject } from '@api/types';
import { workspaceService } from '@api/services/workspace.service';
import { DialogContext, IDialogContext } from '@context/DialogProvider';
import { DIALOG_ACTIONS } from '@context/types';
import AppConfig from '@config/AppConfigModule';
import SearchBox from '@components/SearchBox/SearchBox';
import ProjectList from '../Components/ProjectList';
import AddProjectButton from '../Components/AddProjectButton/AddProjectButton';

const Workspace = () => {
  const history = useHistory();

  const { projects, setProjects, setScanPath, newProject, exportProject, importProject } = useContext(AppContext) as IAppContext;
  const dialogCtrl = useContext(DialogContext) as IDialogContext;
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

  const onShowScanHandler = async (project: IProject) => {
    if (project.appVersion >= AppConfig.MIN_VERSION_SUPPORTED) {
      setScanPath({ path: project.work_root, action: 'none' });
      history.push('/workbench');
    } else {
      const { action } = await dialogCtrl.openAlertDialog(
        'This project was scanned with a previous version that is no longer supported. Would you like to delete it and scan it again?',
        [
          { label: 'Cancel', role: 'cancel' },
          { label: 'Delete & Scan', action: 'delete', role: 'delete' },
        ]
      );

      if (action !== DIALOG_ACTIONS.CANCEL) {
        await deleteProject(project);
        setScanPath({ path: project.scan_root, action: 'scan' });
        history.push('/workspace/new/settings');
      }
    }
  };

  const deleteProject = async (project: IProject) => {
    await workspaceService.deleteProject(project.work_root);
    init();
  };

  const onNewProjectHandler = () => {
    newProject();
  };

  const onImportProjectHandler = () => {
    importProject();
  };

  const onTrashHandler = async (project: IProject) => {
    const { action } = await dialogCtrl.openConfirmDialog('Are you sure you want to delete this project?', {
      label: 'Delete',
      role: 'delete',
    });
    if (action === DIALOG_ACTIONS.OK) {
      await deleteProject(project);
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

  const onExportHandler = async (project: IProject) => {
    exportProject(project);
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
            <div className="search-box">
              {projects && projects.length > 0 && (
                <SearchBox onChange={(value) => setSearchQuery(value.trim().toLowerCase())} />
              )}
            </div>
            <AddProjectButton onNewProject={onNewProjectHandler} onImportProject={onImportProjectHandler} />
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
            onProjectExport={onExportHandler}
            onProjectCreate={onNewProjectHandler}
            onProjectImport={onImportProjectHandler}
          />
        </main>
      </section>
    </>
  );
};

export default Workspace;
