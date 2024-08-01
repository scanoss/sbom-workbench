import api from '../api';
import log from 'electron-log';
import { IpcChannels } from '../ipc-channels';
import { Response } from '../Response';
import { reportService } from '../../main/services/ReportService';

api.handle(IpcChannels.REPORT_SUMMARY, async () => {
  try {
    const summary = await reportService.getReportSummary();
    return Response.ok({ message: 'Summary retrieve successfully retrieved', data: summary });
  } catch (error: any) {
    log.error('[REPORT SUMMARY]: ', error);
    return Response.fail({ message: error.message });
  }
});

api.handle(IpcChannels.REPORT_IDENTIFIED, async () => {
  try {
    const identified = await reportService.getIdentified();
    return Response.ok({ message: 'Identified report successfully retrieved', data: identified });
  } catch (error: any) {
    log.error('[REPORT IDENTIFIED]: ', error);
    return Response.fail({ message: error.message });
  }
});
// TODO: refactor on report detected handle. We should use Response class
api.handle(IpcChannels.REPORT_DETECTED, async (event, arg: string) => {
  try {
    const data = await reportService.getDetected();
    return {
      status: 'ok',
      message: 'detected report successfully retrieved',
      data,
    };
  } catch (error: any) {
    log.error('[REPORT DETECTED]: ', error);
    return Response.fail({ message: error.message });
  }
});

api.handle(IpcChannels.REPORT_GET_DETECTED_COMPONENTS, async (event, license?: string) => {
  try {
    const data = await reportService.getDetectedComponents(license);
    return Response.ok({
      message: 'Detected Components',
      data,
    });
  } catch (error: any) {
    log.error('[REPORT GET DETECTED COMPONENTS]: ', error);
    return Response.fail({ message: error.message });
  }
});

api.handle(IpcChannels.REPORT_GET_IDENTIFIED_COMPONENTS, async (event, license?: string) => {
  try {
    const data = await reportService.getIdentifiedComponents(license);
    return Response.ok({
      message: 'Identified Components',
      data,
    });
  } catch (error: any) {
    log.error('[REPORT GET IDENTIFIED COMPONENTS]: ', error);
    return Response.fail({ message: error.message });
  }
});
