import { IWorkspaceCfg } from '@api/types';
import { GlobalSettingsFormValues, ProxyMode } from './domain';

const extractHostAndPort = (url: string): [string, string] => {
  const urlObj = new URL(url);
  return [urlObj.hostname, urlObj.port];
};

export const mapToGlobalSettingsFormValues = (cfg: IWorkspaceCfg): GlobalSettingsFormValues => {
  const {
    DEFAULT_API_INDEX,
    APIS,
    HTTP_PROXY,
    PAC_PROXY,
    CA_CERT,
    LNG,
    TOKEN,
    GRPC_PROXY,
    NO_PROXY,
    HTTPS_PROXY,
    IGNORE_CERT_ERRORS,
  } = cfg;

  const defaultApi = APIS && APIS[DEFAULT_API_INDEX] ? APIS[DEFAULT_API_INDEX] : null;

  const hasNoProxy = !HTTP_PROXY && !PAC_PROXY;
  const initialProxyMode = hasNoProxy ? ProxyMode.NoProxy : PAC_PROXY ? ProxyMode.Automatic : ProxyMode.Manual;

  const [grpcProxyHost, grpcProxyPort] = GRPC_PROXY ? extractHostAndPort(GRPC_PROXY) : [null, null];
  const [httpHost, httpPort] = HTTP_PROXY ? extractHostAndPort(HTTP_PROXY) : [null, null];
  const [httpsHost, httpsPort] = HTTPS_PROXY ? extractHostAndPort(HTTPS_PROXY) : [null, null];

  return {
    apis: APIS || [],
    apiKey: defaultApi.API_KEY,
    apiUrl: defaultApi.URL,
    language: LNG,
    sbomLedgerToken: TOKEN,
    proxyConfig: {
      mode: initialProxyMode,
      automaticProxyUrl: PAC_PROXY,
      caCertificatePath: CA_CERT,
      grpcProxyHost,
      grpcProxyPort,
      httpHost,
      httpPort,
      httpsHost,
      httpsPort,
      ignoreCertificateErrors: IGNORE_CERT_ERRORS,
      sameConfigAsHttp: httpHost === httpsHost && httpPort === httpsPort,
      whitelistedHosts: NO_PROXY ? NO_PROXY.join(', ') : '',
    },
  };
};
