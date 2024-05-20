import AppConfig from '../../config/AppConfigModule';
import { BaseService } from './base.service';

class ObligationsService extends BaseService {
  private cache: Map<string, any> = new Map();

  public async getObligations(spdxIds: string[], force = false): Promise<any[]> {
    const p = spdxIds.map((spdxId) => this.getObligation(spdxId, force));
    return Promise.all(p);
  }

  public async getObligation(spdxId: string, force: boolean): Promise<any> {
    try {
      if (!force && this.cache.has(spdxId)) {
        return this.cache.get(spdxId);
      }

      const response = await fetch(`${AppConfig.API_URL}/license/obligations/${spdxId}`);
      if (response.ok) {
        const obligations = this.mapper(await response.json());
        this.cache.set(spdxId, obligations);
        return obligations;
      }
      throw new Error(response.statusText);
    } catch (error: any) {
      console.log(error);
      return { label: spdxId, error: true };
    }
  }

  private mapper(obligations) {
    return Object.keys(obligations).map((key) => ({
      label: key,
      ...obligations[key],
      copyleft: obligations[key].copyleft === 'yes',
      incompatibles: obligations[key].incompatible_with ? obligations[key].incompatible_with?.replace(/\s/g, '').split(',') : [],
    }))[0];
  }
}

export default new ObligationsService();
