import { ITask } from '../Task';
import { ISearchComponent } from './iComponentCatalog/ISearchComponent';
import { IComponentResult } from './iComponentCatalog/IComponentResult';
import { CompSearchResponseAdapter } from './adapters/CompSearchResponseAdapter';
import { ComponentsHttpClient, ClientConfig, ComponentSearchRequest } from "scanoss";
import { workspace } from '../../workspace/Workspace';
import { userSettingService } from '../../services/UserSettingService';

export class SearchComponentTask implements ITask<ISearchComponent, Array<IComponentResult>> {
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

  public async run(params: ISearchComponent): Promise<Array<IComponentResult>> {
    const componentHttpClient = new ComponentsHttpClient(this.buildConfig());
    const req: ComponentSearchRequest = { ...params };
    const response = await componentHttpClient.searchComponents(req);
    return CompSearchResponseAdapter.convert(response);
  }
}
