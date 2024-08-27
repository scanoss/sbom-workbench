import { IpcChannels } from '@api/ipc-channels';
import { BaseService } from './base.service';
import { LicenseObligation } from '@api/types';


class ObligationsService extends BaseService {
  private cache: Map<string, any> = new Map();

  public async getObligations(spdxIds: string[], force = false): Promise<LicenseObligation[]> {
    const p = spdxIds.map((spdxId) => this.getObligation(spdxId, force));
    return Promise.allSettled(p).then(results => 
      results
          .filter(result => result.status === 'fulfilled')
          .map(result => (result as PromiseFulfilledResult<any>).value)
  );
  }

  public async getObligation(spdxId: string, force: boolean): Promise<LicenseObligation> {
      if (!force && this.cache.has(spdxId)) {
        return this.cache.get(spdxId);
      }     
      const response = await window.electron.ipcRenderer.invoke(IpcChannels.GET_LICENSE_OBLIGATIONS, spdxId);
      const obligations = this.mapper(response.data);
      this.cache.set(spdxId, obligations);
      return obligations;    
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
