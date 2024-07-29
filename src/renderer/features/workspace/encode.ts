import { IWorkspaceCfg } from '@api/types';
import { ApiFormValues, GlobalSettingsFormValues } from './domain';

const mapToApiDto = (api: ApiFormValues): Record<string, string> => {
  return {
    URL: api.URL || '',
    API_KEY: api.API_KEY || '',
  };
};

export const mapToWorkspaceConfig = (values: GlobalSettingsFormValues): Partial<IWorkspaceCfg> => {
  const APIS = values.apis.map(mapToApiDto);

  return {
    APIS,
    DEFAULT_API_INDEX: values.apiUrl ? APIS.findIndex((api) => api.URL === values.apiUrl) : 0,
    TOKEN: values.sbomLedgerToken || null,
    LNG: values.language || 'en',
    // TODO: Add this
    // proxyConfig: values.proxyConfig,
  };
};
