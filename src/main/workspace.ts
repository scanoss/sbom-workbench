import { ipcMain } from 'electron';
import { IpcEvents } from '../ipc-events';
import { workspace } from './workspace/Workspace';
import { Response } from './Response';
import { INewProject, IProject, License } from '../api/types';
import { ProjectFilterPath } from './workspace/filters/ProjectFilterPath';
import { Project } from './workspace/Project';

ipcMain.handle(IpcEvents.WORKSPACE_PROJECT_LIST, async (event) => {
  try {
    const projects = await workspace.getProjectsDtos();
    return Response.ok({
      message: 'Projects list retrieved succesfully',
      data: projects,
    });
  } catch (error: any) {
    console.error(error);
    return Response.fail({ message: error.message });
  }
});

ipcMain.handle(IpcEvents.WORKSPACE_DELETE_PROJECT, async (event, projectPath: string) => {
  try {
    await workspace.removeProjectFilter(new ProjectFilterPath(projectPath));
    return Response.ok();
  } catch (error: any) {
    console.error(error);
    return Response.fail({ message: error.message });
  }
});

// This service creates a new project and launch automatically the scanner.
// In future versions, the scanner will be launched by the user.
ipcMain.handle(IpcEvents.WORKSPACE_CREATE_PROJECT, async (event, project: INewProject) => {
  try {
    const p = await workspace.createProject(project);
    p.setMailbox(event.sender);
    p.startScanner();
    return Response.ok();
  } catch (error: any) {
    console.error(error);
    return Response.fail({ message: error.message });
  }
});

ipcMain.handle(IpcEvents.UTILS_GET_PROJECT_DTO, async (event) => {
  try {
    const path: IProject = workspace.getOpenedProjects()[0].getDto();
    return Response.ok({ message: 'Project path succesfully retrieved', data: path });
  } catch (e: any) {
    console.log('Catch an error: ', e);
    return Response.fail({ message: e.message });
  }
});

ipcMain.handle(IpcEvents.GET_LICENSES, async (event) => {
  try {
    const licenses: Array<License> = workspace.getLicenses();
    return Response.ok({ message: 'Project path succesfully retrieved', data: licenses });
  } catch (e: any) {
    console.log('Catch an error: ', e);
    return Response.fail({ message: e.message });
  }
});

ipcMain.handle(IpcEvents.WORKSPACE_IMPORT_PROJECT, async (event, zippedProject: string) => {
  try {

    // Validacion:
    // - Verificar que el zip solamente tenga una carpeta. (Traer el listado de archivos dentro del .zip)
    // - Verificar que solo exista una folder y obetener su nombre

    if (workspace.existProject("ansible")) throw new Error('Project already exists');

    // unzip the project in workspace directory workspace.getMyPath();




    // ***** Llamar al helper para validar la importacion. ***** //

    // Verificar que los archivos minimos esten disponibles
    const validFileNames = new Set(["metadata.json", "result.json", "scan_db", "tree.json", "winnowing.wfp"]);

    // Verificar la version de metadata sea mayor o igual a la version minima soportada.

    // Reemplazar el scan_root por null.

    // Add metadata field "source": "imported"

    // ***** Llamar al helper para validar la importacion. ***** //


    const extractedProjectPath = '';
    const p = await Project.readFromPath(extractedProjectPath);
    workspace.addProject(p);

    return Response.ok({ message: 'Project imported succesfully' });
  } catch (e: any) {
    // TODO: delete the folder created
    console.log('Catch an error: ', e);
    return Response.fail({ message: e.message });
  }
});

ipcMain.handle(IpcEvents.WORKSPACE_EXPORT_PROJECT, async (event, pathToSave: string, projectPath: string) => {
  try {

    const p = workspace.getProject(new ProjectFilterPath(projectPath));
    p.export(pathToSave);

    return Response.ok({ message: 'Project path succesfully retrieved', data: licenses });
  } catch (e: any) {
    console.log('Catch an error: ', e);
    return Response.fail({ message: e.message });
  }
});

