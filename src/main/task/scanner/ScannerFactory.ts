import { userSettingService } from '../../services/UserSettingService';
import { workspace } from '../../workspace/Workspace';

export interface ScannerConfig {
  API_URL: string;
  API_KEY: string;
  HTTP_PROXY: string;
  HTTPS_PROXY: string;
  IGNORE_CERT_ERRORS: boolean;
  CA_CERT: string | null;
}

export class ScannerFactory {
  private static buildConfig(): ScannerConfig {
    const project = workspace.getOpenProject();
    const {
      DEFAULT_API_INDEX,
      APIS,
      HTTP_PROXY,
      HTTPS_PROXY,
      PAC_PROXY,
      CA_CERT,
      IGNORE_CERT_ERRORS,
    } = userSettingService.get();

    const apiUrl = project.getApi() || APIS[DEFAULT_API_INDEX].URL;
    const apiKey = project.getApiKey() || APIS[DEFAULT_API_INDEX].API_KEY;
    const PAC_URL = PAC_PROXY ? `pac+${PAC_PROXY.trim()}` : null;

    return {
      API_URL: apiUrl,
      API_KEY: apiKey,
      HTTP_PROXY: PAC_URL || HTTP_PROXY || '',
      HTTPS_PROXY: PAC_URL || HTTPS_PROXY || '',
      IGNORE_CERT_ERRORS: IGNORE_CERT_ERRORS || false,
      CA_CERT: CA_CERT || null,
    };
  }
  static createScanner<T, S>(ConfigClass: new () => T, ScannerClass: new (config: T) => S): S {
    const configData = this.buildConfig();
    const cfg = new ConfigClass();

    Object.assign(cfg, configData);
    return new ScannerClass(cfg);
  }
}
