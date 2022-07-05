import { ExportFormat } from '../api/types';

export interface IAppConfig {
  APP_NAME: string;
  ABOUT_MESSAGE: string;
  SCANOSS_WEBSITE_URL: string;

  API_URL: string;
  API_KEY: string;
  MIN_VERSION_SUPPORTED: string;
  DEFAULT_WORKSPACE_NAME: string;
  DEFAULT_IP_gRPC: string;
  DEFAULT_PORT_gRPC: number;

  // feature flags
  FF_ENABLE_COMPONENT_LOGO: boolean;
  FF_ENABLE_WORKBENCH_FILTERS: boolean;
  FF_EXPORT_FORMAT_OPTIONS: Array<ExportFormat>;
  FF_ENABLE_AUTO_ACCEPT_AFTER_SCAN: boolean;
  FF_ENABLE_API_CONNECTION_SETTINGS: boolean;

  // search engine
  SEARCH_ENGINE_DEFAULT_LIMIT: number;
}
