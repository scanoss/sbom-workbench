import { ipcMain } from 'electron';
import log from "electron-log";
import { NewLicenseDTO } from "@api/dto";
import { IpcChannels } from '../ipc-channels';
import { Response } from '../Response';
import { licenseService } from "../../main/services/LicenseService";


ipcMain.handle(IpcChannels.LICENSE_GET_ALL, async (_event) => {
  try {
    const license = await licenseService.getAll();
    return Response.ok({message: 'Licenses successfully retrieved', data: license});
  } catch (error: any) {
    log.error(error);
    return Response.fail({message: error.message});
  }
});

ipcMain.handle(IpcChannels.LICENSE_GET, async (_event, id:number) => {
  try {
    const license = await licenseService.get(id);
    return Response.ok({ message: 'License successfully', data: license });
  } catch (error: any) {
    log.error(error);
    return Response.fail({ message: error.message });
  }
});

ipcMain.handle(IpcChannels.LICENSE_CREATE, async (_event, newLicense: NewLicenseDTO) => {
  try {
    const license = await licenseService.create(newLicense);
    return Response.ok({ message: 'License created successfully', data: license });
  } catch (error: any) {
    console.log('Catch an error: ', error);
    return Response.fail({ message: error.message });
  }
});
