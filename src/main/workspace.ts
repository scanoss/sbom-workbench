import { ipcMain } from 'electron';
import { IpcEvents } from '../ipc-events';
import { workspace } from './workspace/workspace';
import { Response } from './Response';
import { Project } from './workspace/Project';
import { WSA_E_CANCELLED } from 'constants';
import Workspace from '../renderer/features/workspace/Workspace';
import { Dashboard } from '@material-ui/icons';

/*
Agregar workspace_create_project
Agregar workspace_open_project
*/

// ipcMain.handle(IpcEvents.WORKSPACE_CREATE_PROJECT, async (event, path) => {

//   // Crear un objeto metadata
//   mt.name = path;
//   mt.date = new Date();
//   mt.license = "";

//   //agreagar los getters y setters
//   new Metadata(path);
//   mt.save();
//   p = new ProjectTree(mt)
//   p.load()
//   ws.addProjecr(p)



//   // p = new Project(mt: metadata)
//   // p.init()   iniciarlo
//   // p.setStdOut(event)   agregar una clase para abstraer los eventos
//   // ws.addProject(p);

//   // return el estatus


// });

// ipcMain.handle(IpcEvents.WORKSPACE_OPEN_PROJECT, async (event, projectId) => {


// ws.getProjectByID(projectId).load();

// [new ProjectTree(), new ProjectTree(), new ProjectTree(), new ProjectTree()]  => WS

// [new MediaMetadata(), new MediaMetadata(), new MediaMetadata(), new MediaMetadata()] => UI


// });


// ipcMain.handle(IpcEvents.WORKSPACE_CLOSE_PROJECT, async (event, projectId) => {

//   ws = workspace;
//   ws.getProjectByID(projectId).close();

// });



ipcMain.handle(IpcEvents.WORKSPACE_PROJECT_LIST, async (event) => {

  try {
    const projects = await workspace.listProjects();
    return Response.ok({
      message: 'Projects list retrieved succesfully',
      data: projects,
    });
  } catch (error) {
    console.error(error);
    return Response.fail({ message: error.message });
  }
});

ipcMain.handle(IpcEvents.WORKSPACE_DELETE_PROJECT, async (event, projectPath: string) => {
  try {
    workspace.deleteProject(projectPath);
    return Response.ok();
  } catch (error) {
    console.error(error);
    return Response.fail({ message: error.message });
  }
});
