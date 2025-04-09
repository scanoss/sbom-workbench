import log from 'electron-log';
import api from '../api';
import { IpcChannels } from '../ipc-channels';
import { Response } from '../Response';
import { ExportControlGetAllDTO } from '../dto';
import { exportControlService } from '../../main/services/ExportControlService';

api.handle(IpcChannels.EXPORT_CONTROL_GET_ALL, async (event, dto : ExportControlGetAllDTO) => {
  try {
    const data = await exportControlService.getAll(dto);
    return Response.ok({ message: 'Export control retrieved successfully', data });
  } catch (error: any) {
    log.error('[Export Control Get All]: ', error);
    return Response.fail({ message: error.message });
  }
});
