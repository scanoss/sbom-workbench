import { IAppConfig } from './IAppConfig';

export const AppConfigDefault: IAppConfig = {
  APP_NAME: 'SCANOSS Audit Workbench',
  API_URL: 'https://osskb.org/api',
  MIN_VERSION_SUPPORTED: '0.17.0',
  DEFAULT_WORKSPACE_NAME: 'scanoss-workspace',
  FF_ENABLE_COMPONENT_LOGO: true,
  FF_ENABLE_WORKBENCH_FILTERS: true,
  FF_EXPORT_FORMAT_OPTIONS: ['spdx', 'csv', 'html', 'raw', 'json'],
  FF_ENABLE_AUTO_ACCEPT_AFTER_SCAN: false,
};
