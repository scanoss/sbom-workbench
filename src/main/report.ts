import { ipcMain } from 'electron';
import { IpcEvents } from '../ipc-events';
import { defaultProject } from './workspace/ProjectTree';

interface licenseEntry {
  label: string;
  components: any[];
  value: number;
  incompatibles:string[];
}
interface cryptoEntry {
  label: string;
  components: any[];
  value: number;
  strength: number;
}

interface inventoryProgress {

  totalFiles: number;
  scannedFiles: number;
  excludedFiles: number;
  detectedComponents: number;
  acceptedComponents:number;


}


ipcMain.handle(IpcEvents.REPORT_LICENSES, async (event, arg: string) => {
  let success: boolean;
  let licenses: licenseEntry[];
licenses=[];
  try {
    console.log('pase por aca');
    const a = defaultProject.results;
    for (const [key, results] of Object.entries(a)) {
      for (const result of results) {
        if (result.id != 'none') {
          if (result.licenses != undefined && result.licenses[0] != undefined) {
            if (!licenses.some((l) => l.label === result.licenses[0].name)) {
              let newLicense = {label:"",components:[],value:1};
              newLicense.label=result.licenses[0].name;
              newLicense.components.push(result.component)
              licenses.push(newLicense);
            }
            else {
              let index = licenses.findIndex(l=> l.label === result.licenses[0].name);
              if(index >=0) {
                if(! licenses[index].components.some((c)=>c.component)===result.component)
                licenses[index].components.push(result.component)
                licenses[index].value =  licenses[index].components.length;
              }
          }
        }
            }
                }
              }

 console.log(licenses);
    return {
      status: 'ok',
      message: 'SPDX export successfully',
      data: licenses,
    };
  } catch (e) {
    console.log('Catch an error: ', e);
    return { status: 'fail' };
  }
});
