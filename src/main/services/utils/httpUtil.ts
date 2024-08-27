import { workspace } from "../../../main/workspace/Workspace";
import { HttpProxyConfig } from "scanoss";
import { userSettingService } from "../UserSettingService";

export const getHttpConfig = (): HttpProxyConfig => {
    const project = workspace.getOpenedProjects()[0];
    const {
      DEFAULT_API_INDEX,
      APIS,
      HTTP_PROXY,
      HTTPS_PROXY,
      PAC_PROXY,
      NO_PROXY,
      CA_CERT,
      IGNORE_CERT_ERRORS,
    } = userSettingService.get();

    const cfg:HttpProxyConfig = {
      PAC_PROXY: PAC_PROXY,
      HTTP_PROXY: HTTP_PROXY,
      HTTPS_PROXY: HTTPS_PROXY,
      NO_PROXY: NO_PROXY,
      API_KEY: project.getApi() ? project.getApiKey() : APIS[DEFAULT_API_INDEX].API_KEY,     
      CA_CERT: CA_CERT,
      IGNORE_CERT_ERRORS: IGNORE_CERT_ERRORS    
    }

    return cfg;
};