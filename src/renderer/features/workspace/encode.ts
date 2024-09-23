import { IWorkspaceCfg } from '@api/types';
import { ApiFormValues, GlobalSettingsFormValues, ProxyMode } from './domain';

const mapToApiDto = (api: ApiFormValues): Record<string, string> => {
  return {
    URL: api.URL || '',
    API_KEY: api.API_KEY || '',
  };
};

type ProxyConfig = Pick<
IWorkspaceCfg,
'IGNORE_CERT_ERRORS' | 'CA_CERT' | 'GRPC_PROXY' | 'NO_PROXY' | 'HTTP_PROXY' | 'HTTPS_PROXY' | 'PAC_PROXY'
>;

export const mapToProxyConfig = (values: GlobalSettingsFormValues): ProxyConfig | null => {
  if (!values.proxyConfig) return null;

  const {
    mode,
    ignoreCertificateErrors,
    caCertificatePath,
    automaticProxyUrl,
    whitelistedHosts,
    httpHost,
    httpPort,
    httpsHost,
    httpsPort,
    grpcProxyHost,
    grpcProxyPort,
  } = values.proxyConfig;

  const commonConfig = {
    CA_CERT: caCertificatePath,
    GRPC_PROXY: grpcProxyHost && grpcProxyPort ? `${grpcProxyHost}:${grpcProxyPort}` : null,
    IGNORE_CERT_ERRORS: ignoreCertificateErrors,
    NO_PROXY: whitelistedHosts.split(',').map((host) => host.trim()),
  };

  if (mode === ProxyMode.NoProxy) {
    return {
      ...commonConfig,
      HTTP_PROXY: null,
      HTTPS_PROXY: null,
      PAC_PROXY: null,
    };
  }

  if (mode === ProxyMode.Automatic) {
    return {
      ...commonConfig,
      HTTP_PROXY: null,
      HTTPS_PROXY: null,
      PAC_PROXY: automaticProxyUrl,
    };
  }

  return {
    ...commonConfig,
    HTTP_PROXY: `${httpHost}:${httpPort}`,
    HTTPS_PROXY: `${httpsHost}:${httpsPort}`,
    PAC_PROXY: null,
  };
};

export const mapToWorkspaceConfig = (values: GlobalSettingsFormValues): Partial<IWorkspaceCfg> => {
  const APIS = values.apis.map(mapToApiDto);

  return {
    APIS,
    DEFAULT_API_INDEX:
      values.apiUrl && values.apiKey
        ? APIS.findIndex((api) => api.URL === values.apiUrl && api.API_KEY === values.apiKey)
        : APIS.findIndex((api) => api.URL === values.apiUrl) || 0,
    TOKEN: values.sbomLedgerToken || null,
    LNG: values.language || 'en',
    ...mapToProxyConfig(values),
  };
};
