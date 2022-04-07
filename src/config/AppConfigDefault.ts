import { ExportFormat } from '../api/types';
import { IAppConfig } from './IAppConfig';

export const AppConfigDefault: IAppConfig = {
  APP_NAME: 'SCANOSS Audit Workbench',
  API_URL: 'https://osskb.org/api',
  MIN_VERSION_SUPPORTED: '0.17.0',
  DEFAULT_WORKSPACE_NAME: 'scanoss-workspace',
  FF_ENABLE_COMPONENT_LOGO: true,
  FF_ENABLE_WORKBENCH_FILTERS: true,
  FF_EXPORT_FORMAT_OPTIONS: [
    ExportFormat.CSV,
    ExportFormat.SPDXLITEJSON,
    ExportFormat.WFP,
    ExportFormat.RAW,
    ExportFormat.HTMLSUMMARY,
  ],
  FF_ENABLE_AUTO_ACCEPT_AFTER_SCAN: false,
  FF_ENABLE_API_CONNECTION_SETTINGS: true,
};
