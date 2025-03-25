import log from 'electron-log';
import { NewExportDTO } from 'api/dto';
import api from '../api';
import { IpcChannels } from '../ipc-channels';
import { Response } from '../Response';
import { Export } from '../../main/task/export/Export';


const pathLib = require('path');

const crypto = require('crypto');

api.handle(IpcChannels.EXPORT, async (_event, params: NewExportDTO) => {
  try {
    const exportTask = new Export();
    exportTask.setFormat(params);
    const exportResults = await exportTask.run(params.path);
    return Response.ok({ message: 'File exported successfully', data: exportResults });
  } catch (e: any) {
    log.error('Catch an error: ', e, params);
    return Response.fail({ message: e.message });
  }
});

