import { ExportFormat } from '../api/types';
import { IAppConfig } from './IAppConfig';

export const AppConfigDefault: IAppConfig = {
  APP_NAME: 'SCANOSS SBOM Workbench',
  ORGANIZATION_NAME: 'SCANOSS',
  ABOUT_MESSAGE: 'SBOM Workbench brings free of charge, secure and anonymous Open Source Auditing to your desktop.',
  ORGANIZATION_URL: 'https://www.scanoss.com',
  DEFAULT_WORKSPACE_NAME: 'scanoss-workspace',
  ORGANIZATION_EMAIL: 'info@scanoss.com',

  // connection settings
  API_URL: 'https://api.osskb.org',
  API_KEY: '',
  API_SCAN_PATH: '/scan/direct',
  API_CONTENT_PATH: '/file_contents',
  DEFAULT_SETTING_NAME: '.scanoss',
  OSSKB_HOST: 'api.osskb.org',
  DEFAULT_IP_gRPC: 'api.scanoss.com',
  DEFAULT_PORT_gRPC: 443,
  DEFAULT_MULTIUSER_LOCK_TIMEOUT: 30,
  DEFAULT_SERVICE_CHUNK_LIMIT: 1,

  // feature flags
  FF_ENABLE_COMPONENT_LOGO: true,
  FF_ENABLE_WORKBENCH_FILTERS: true,
  FF_EXPORT_FORMAT_OPTIONS: [
    ExportFormat.RAW,
    ExportFormat.WFP,
    ExportFormat.CSV,
    ExportFormat.SPDXLITEJSON,
    ExportFormat.CYCLONEDX,
    ExportFormat.HTMLSUMMARY,
    ExportFormat.SETTINGS,
  ],
  FF_ENABLE_AUTO_ACCEPT_AFTER_SCAN: false,
  FF_ENABLE_API_CONNECTION_SETTINGS: true,
  FF_ENABLE_SCAN_VULNERABILITY: true,
  FF_ENABLE_SCAN_CRYPTOGRAPHY: true,
  FF_ENABLE_SETTINGS_HINT: true,

  // other config
  MIN_VERSION_SUPPORTED: '0.17.0',
  SEARCH_ENGINE_DEFAULT_LIMIT: 500,
};
