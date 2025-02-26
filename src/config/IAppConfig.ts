import { ExportFormat } from '../api/types';

export interface IAppConfig {
  APP_NAME: string;
  ORGANIZATION_NAME: string;
  ORGANIZATION_URL: string;
  DEFAULT_WORKSPACE_NAME: string;
  ORGANIZATION_EMAIL: string;

  ABOUT_MESSAGE: string;
  DEFAULT_SETTING_NAME: string;

  DEFAULT_SERVICE_CHUNK_LIMIT: number;

  OSSKB_HOST: string;
  API_URL: string;
  API_KEY: string;

  API_CONTENT_PATH: string;
  API_SCAN_PATH: string;

  DEFAULT_IP_gRPC: string;
  DEFAULT_PORT_gRPC: number;

  DEFAULT_MULTIUSER_LOCK_TIMEOUT: number;

  // feature flags
  FF_ENABLE_COMPONENT_LOGO: boolean;
  FF_ENABLE_WORKBENCH_FILTERS: boolean;
  FF_EXPORT_FORMAT_OPTIONS: Array<ExportFormat>;
  FF_ENABLE_AUTO_ACCEPT_AFTER_SCAN: boolean;
  FF_ENABLE_API_CONNECTION_SETTINGS: boolean;
  FF_ENABLE_SCAN_VULNERABILITY: boolean;
  FF_ENABLE_SCAN_CRYPTOGRAPHY: boolean;
  FF_ENABLE_SETTINGS_HINT: boolean;

  SEARCH_ENGINE_DEFAULT_LIMIT: number;
  MIN_VERSION_SUPPORTED: string;
}
