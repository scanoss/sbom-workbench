import { ExportFormat } from '../api/types';
import { IAppConfig } from './IAppConfig';

export const AppConfigDefault: IAppConfig = {
  APP_NAME: 'SCANOSS SBOM Workbench',
  ABOUT_MESSAGE: 'SBOM Workbench brings free of charge, secure and anonymous Open Source Auditing to your desktop.',
  OSSKB_HOST: 'osskb.org',
  API_URL: 'https://osskb.org/api',
  API_KEY: '',
  API_SCAN_PATH: '/scan/direct',
  API_CONTENT_PATH: '/file_contents',
  SCANOSS_WEBSITE_URL: 'https://www.scanoss.com',
  MIN_VERSION_SUPPORTED: '0.17.0',
  DEFAULT_WORKSPACE_NAME: 'scanoss-workspace',
  DEFAULT_IP_gRPC: 'scanoss.com',
  DEFAULT_PORT_gRPC: 443,
  FF_ENABLE_COMPONENT_LOGO: true,
  FF_ENABLE_WORKBENCH_FILTERS: true,
  FF_EXPORT_FORMAT_OPTIONS: [
    ExportFormat.RAW,
    ExportFormat.WFP,
    ExportFormat.CSV,
    ExportFormat.SPDXLITEJSON,
    ExportFormat.HTMLSUMMARY,
  ],
  FF_ENABLE_AUTO_ACCEPT_AFTER_SCAN: false,
  FF_ENABLE_API_CONNECTION_SETTINGS: true,
  FF_ENABLE_SCAN_VULNERABILITY: true,
  SEARCH_ENGINE_DEFAULT_LIMIT: 500,
};
