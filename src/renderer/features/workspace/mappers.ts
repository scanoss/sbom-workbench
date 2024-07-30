import { IWorkspaceCfg } from '@api/types';
import { GlobalSettingsFormValues, ProxyMode } from './domain';

const extractHostAndPort = (url: string): [string, string] | [null, null] => {
  const [host, port] = url.split(':');

  if (!host || !port) {
    return [null, null];
  }

  return [host, port];
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

  const [grpcProxyHost, grpcProxyPort] = extractHostAndPort(GRPC_PROXY);
  const [httpHost, httpPort] = extractHostAndPort(HTTP_PROXY);
  const [httpsHost, httpsPort] = extractHostAndPort(HTTPS_PROXY);

  const sameConfigAsHttp = !!httpHost && !!httpPort && !!httpsHost && httpsPort && httpHost === httpsHost && httpPort === httpsPort;

  return {
    apiKey: defaultApi.API_KEY,
    apis: APIS || [],
    apiUrl: defaultApi.URL,
    language: LNG,
    sbomLedgerToken: TOKEN,
    proxyConfig: {
      automaticProxyUrl: PAC_PROXY,
      caCertificatePath: CA_CERT,
      grpcProxyHost,
      grpcProxyPort,
      httpHost,
      httpPort,
      httpsHost,
      httpsPort,
      ignoreCertificateErrors: IGNORE_CERT_ERRORS,
      mode: initialProxyMode,
      sameConfigAsHttp,
      whitelistedHosts: NO_PROXY ? NO_PROXY.join(', ') : '',
    },
  };
};
