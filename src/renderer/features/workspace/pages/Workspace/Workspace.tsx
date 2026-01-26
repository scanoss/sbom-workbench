import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext, IAppContext } from '@context/AppProvider';
import { IProject, ProjectAccessMode, WorkspaceData } from '@api/types';
import { workspaceService } from '@api/services/workspace.service';
import { DialogContext, IDialogContext } from '@context/DialogProvider';
import { DIALOG_ACTIONS } from '@context/types';
import AppConfig from '@config/AppConfigModule';
import SearchBox from '@components/SearchBox/SearchBox';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects, removeWorkspace, setSettings } from '@store/workspace-store/workspaceThunks';
import { selectWorkspaceState, setScanPath } from '@store/workspace-store/workspaceSlice';
import { useTranslation } from 'react-i18next';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import ProjectList from '../Components/ProjectList';
import AddProjectButton from '../Components/AddProjectButton/AddProjectButton';

/* icons */
import { WorkspaceSelector } from '../Components/WorskpaceSelector/WorkspaceSelector';

const Workspace = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const { settings } = useSelector(selectWorkspaceState);
  const { projects } = useSelector(selectWorkspaceState);

  const { newProject, exportProject, importProject, newProjectFromWFP, importFromResultFile } = useContext(AppContext) as IAppContext;
  const dialogCtrl = useContext(DialogContext) as IDialogContext;
  const [searchQuery, setSearchQuery] = useState<string>('');

  const init = async () => {
    try {
      dispatch(fetchProjects());
    } catch (error) {
      alert(error);
    }
  };

  const cleanup = () => {};

  const onShowScanHandler = async (project: IProject, mode: ProjectAccessMode) => {
    if (project.appVersion >= AppConfig.MIN_VERSION_SUPPORTED) {
      dispatch(setScanPath({ path: project.work_root, action: 'none', mode }));
      navigate('/workbench/detected');
    } else {
      const { action } = await dialogCtrl.openAlertDialog(
        t('Dialog:ProjectSannedPreviousVersionQuestion'),
        [
          { label: t('Button:Cancel'), role: 'cancel' },
          { label: t('Button:Delete&Scan'), action: 'delete', role: 'delete' },
        ],
      );

      if (action !== DIALOG_ACTIONS.CANCEL) {
        await deleteProject(project);
        dispatch(setScanPath({ path: project.scan_root, action: 'scan' }));
        navigate('/workspace/new/settings');
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

  const onNewProjectFromWFPHandler = () => {
    newProjectFromWFP();
  };

  const onImportFromResultFile = () => {
    importFromResultFile();
  };


  const onWorkspaceSelectedHandler = async (workspace: WorkspaceData) => {
    await workspaceService.setCurrent(workspace.PATH);
  };

  const onWorkspaceRemoveHandler = (workspace: WorkspaceData) => {
    dispatch(removeWorkspace(workspace));
  };

  const onWorkspaceCreateHandler = async () => {
    const existingPaths = settings?.WORKSPACES?.map((w) => w.PATH) || [];
    const { action, data } = await dialogCtrl.openWorkspaceAddDialog(existingPaths);
    if (action !== DIALOG_ACTIONS.CANCEL) {
      await dispatch(setSettings({
        ...settings,
        WORKSPACES: [...settings.WORKSPACES, data],
      }));
      await onWorkspaceSelectedHandler(data);
    }
  };

  const onTrashHandler = async (project: IProject) => {
    const { action } = await dialogCtrl.openConfirmDialog(t('Dialog:DeleteQuestion'), {
      label: t('Button:Delete'),
      role: 'delete',
    });
    if (action === DIALOG_ACTIONS.OK) {
      await deleteProject(project);
      init();
    }
  };

  const onRescanHandler = async (project: IProject) => {
    const { action } = await dialogCtrl.openConfirmDialog(t('Dialog:RescanQuestion'), {
      label: t('Button:OK'),
      role: 'accept',
    });
    if (action === DIALOG_ACTIONS.OK) {
      dispatch(setScanPath({ path: project.work_root, action: 'rescan', projectName: project.name }));
      navigate('/workspace/new/scan');
      init();
    }
  };

  const onRestoreHandler = async (project: IProject) => {
    dispatch(setScanPath({ path: project.work_root, action: 'resume', projectName: project.name }));
    navigate('/workspace/new/scan');
  };

  const onExportHandler = async (project: IProject) => {
    exportProject(project);
  };

  useEffect(() => {
    init();
    return cleanup;
  }, []);

  return (
    <section id="Workspace" className="app-page">
      <header className="app-header">
        <div className="workspace-selector">
          <WorkspaceSelector
            workspaces={settings?.WORKSPACES}
            selected={settings?.WORKSPACES[settings?.DEFAULT_WORKSPACE_INDEX]}
            onSelected={onWorkspaceSelectedHandler}
            onRemoved={onWorkspaceRemoveHandler}
            onCreated={onWorkspaceCreateHandler}
          />
          <ChevronRightOutlinedIcon fontSize="small" />
          <h4 className="">{t('Title:Projects')}</h4>
        </div>

        <section className="subheader">
          <div className="search-box">
            {projects && projects.length > 0 && (
            <SearchBox onChange={(value) => setSearchQuery(value.trim().toLowerCase())} />
            )}
          </div>
          <AddProjectButton
            onNewProject={onNewProjectHandler}
            onImportProject={onImportProjectHandler}
            onNewProjectFromWFP={onNewProjectFromWFPHandler}
            importFromResultFile={onImportFromResultFile}
          />
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
  );
};

export default Workspace;
