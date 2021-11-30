import { ipcMain } from 'electron';
import { resultService } from '../api/results-service';
import { IFolderInventory, Inventory, InventoryAction } from '../api/types';
import { IpcEvents } from '../ipc-events';
import { logicInventoryService } from './services/LogicInventoryService';
import { logicResultService } from './services/LogicResultService';
import { logictTreeService } from './services/LogicTreeService';
import { NodeStatus } from './workspace/Tree/Tree/Node';
import { workspace } from './workspace/Workspace';

ipcMain.handle(IpcEvents.INVENTORY_GET_ALL, async (event, invget: Partial<Inventory>) => {
  let inv: any;
  try {
    inv = await workspace.getOpenedProjects()[0].scans_db.inventories.getAll(invget);
    return { status: 'ok', message: inv, data: inv };
  } catch (e) {
    console.log('Catch an error: ', e);
    return { status: 'fail' };
  }
});

ipcMain.handle(IpcEvents.INVENTORY_GET, async (event, inv: Partial<Inventory>) => {
  try {
    const inventory: Inventory = await logicInventoryService.get(inv);
    return { status: 'ok', message: 'Inventory retrieve successfully', data: inventory };
  } catch (e) {
    console.log('Catch an error: ', e);
    return { status: 'fail' };
  }
});

ipcMain.handle(IpcEvents.INVENTORY_CREATE, async (event, arg: Inventory) => {
  try {
    console.log("CREATE");
    const p = workspace.getOpenedProjects()[0];
    const inv = await p.scans_db.inventories.create(arg);  
    logicResultService.getResultsFromIDs(arg.files).then((files:any) => {
      const paths = getArrayFromObject(files,'path') as Array<string>;
      paths.forEach(path => {
        p.getTree().getRootFolder().setStatus(path, NodeStatus.IDENTIFIED);
      });
      p.updateTree();
    });
    return { status: 'ok', message: 'Inventory created', data: inv };
  } catch (e) {
    console.log('Catch an error on inventory: ', e);
    return { status: 'fail' };
  }
});

ipcMain.handle(IpcEvents.INVENTORY_ATTACH_FILE, async (event, arg: Partial<Inventory>) => {
  try {
    console.log("ATTACh");
    console.log(arg);
    const p = workspace.getOpenedProjects()[0];
    const success = await p.scans_db.inventories.attachFileInventory(arg);
    return { status: 'ok', message: 'File attached to inventory successfully', success };
  } catch (e) {
    console.log('Catch an error on inventory: ', e);
    return { status: 'fail' };
  }
});

ipcMain.handle(IpcEvents.INVENTORY_DETACH_FILE, async (event, inv: Partial<Inventory>) => {
  try {  
   logicResultService.getResultsFromIDs(inv.files).then((files:any) => {
    const paths = getArrayFromObject(files,'path') as Array<string>;
    logictTreeService.retoreStatus(paths);
   });   
   const success: boolean = await logicInventoryService.detach(inv);

    return { status: 'ok', message: 'File detached to inventory successfully', success };
  } catch (e) {
    console.log('Catch an error on inventory: ', e);
    return { status: 'fail' };
  }
});

ipcMain.handle(IpcEvents.INVENTORY_DELETE, async (event, arg: Partial<Inventory>) => {
  try {
    const p = workspace.getOpenedProjects()[0];
    p.scans_db.inventories.getInventoryFiles(arg).then((files:any) => {
      const paths =  getArrayFromObject(files, 'path');
      logictTreeService.retoreStatus(paths);
    });
    const success = await p.scans_db.inventories.delete(arg);
    if (success) return { status: 'ok', message: 'Inventory deleted successfully', success };
    return { status: 'error', message: 'Inventory was not deleted successfully', success };
  } catch (e) {
    console.log('Catch an error on inventory: ', e);
    return { status: 'fail' };
  }
});

ipcMain.handle(IpcEvents.INVENTORY_FROM_COMPONENT, async (event) => {
  try {
    const data = await workspace.getOpenedProjects()[0].scans_db.inventories.getFromComponent();
    if (data) return { status: 'ok', message: 'Inventories from component', data };
    return { status: 'error', message: 'Inventory from component was not successfully retrieve', data };
  } catch (e) {
    console.log('Catch an error on inventory: ', e);
    return { status: 'fail' };
  }
});

ipcMain.handle(IpcEvents.INVENTORY_FOLDER, async (event, arg: IFolderInventory) => {
  try {    
    const project = workspace.getOpenedProjects()[0];
    const files:any= await logicResultService.getFilesInFolder(arg.folder);
   
    let success= false;
    if(arg.action === InventoryAction.RESTORE) { 

      const restoreFiles = getArrayFromObject(files, 'id','identified');
     logicResultService.getResultsFromIDs(restoreFiles).then((filesToUpdate:any) => {
       // move getArratFromObject 
      const paths = getArrayFromObject(filesToUpdate, 'path') as Array<string>;     
      logictTreeService.retoreStatus(paths);         
    });     
      success = await logicInventoryService.detach({ files:restoreFiles } as Partial<Inventory>);

    }else if(arg.overwrite){
      if (arg.action === InventoryAction.IDENTIFY) {
        const restoreFiles = getArrayFromObject(files, 'id','identified');
        await logicInventoryService.detach({ files:restoreFiles } as Partial<Inventory>);
      }
       // const inv = await project.scans_db.inventories.create({});  
        //success = await logicInventoryService.attach({ files:files } as Partial<Inventory>);
      }else if(!arg.overwrite){
        if (arg.action === InventoryAction.IDENTIFY){
          const pendingFiles = getArrayFromObject(files, 'id','pending');


        }
        
      }
      
    

 
   return { status: 'ok', message: 'Inventories from component', data: success};

  } catch (e) {
    console.log('Catch an error on inventory: ', e);
    return { status: 'fail' };
  } 
});

function getArrayFromObject(results:any[],value:any,condition?:any){
  const array = [];
  results.forEach(result => {
    if(condition){
      if(result[condition])   array.push(result[value]);
    }else
     array.push(result[value]);
});
return array;

}
