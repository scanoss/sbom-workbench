import { ITask } from '../Task';
import { ISearchComponentVersion } from './iComponentCatalog/ISearchComponentVersion';
import { IComponentVersionResult } from './iComponentCatalog/IComponentVersionResult';
import { CompoVerSearchResponseAdapter } from './adapters/CompoVerSearchResponseAdapter';
import { ClientConfig, ComponentVersionRequest , ComponentsHttpClient } from '../../../../../scanoss.js/src';
import { workspace } from '../../workspace/Workspace';
import { userSettingService } from '../../services/UserSettingService';

export class SearchComponentVersionTask implements ITask<ISearchComponentVersion, IComponentVersionResult> {
  private buildConfig(): ClientConfig {
    const project = workspace.getOpenProject();
    const { DEFAULT_API_INDEX, APIS, HTTP_PROXY, HTTPS_PROXY, PAC_PROXY, CA_CERT, IGNORE_CERT_ERRORS } =
      userSettingService.get();

    const apiUrl = project.getApi() || APIS[DEFAULT_API_INDEX].URL;
    const apiKey = project.getApiKey() || APIS[DEFAULT_API_INDEX].API_KEY;
    const PAC_URL = PAC_PROXY ? `pac+${PAC_PROXY.trim()}` : null;

    return {
      HOST_URL: apiUrl,
      API_KEY: apiKey,
      HTTP_PROXY: PAC_URL || HTTP_PROXY || '',
      HTTPS_PROXY: PAC_URL || HTTPS_PROXY || '',
      IGNORE_CERT_ERRORS: IGNORE_CERT_ERRORS || false,
      CA_CERT: CA_CERT || null,
    };
  }


  public async run(params: ISearchComponentVersion): Promise<IComponentVersionResult> {
    const componentHttpClient = new ComponentsHttpClient(this.buildConfig());
    const req: ComponentVersionRequest = { ...params };
    const response = await componentHttpClient.getComponentVersions(req);
    return CompoVerSearchResponseAdapter.convert(response);
  }
}
