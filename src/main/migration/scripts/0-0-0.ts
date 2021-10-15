import { app } from 'electron';
import fs from 'fs';
import packageJson from '../../../package.json'

export function wsCfgUpdate(wsPath: string) {
  const cfgData = fs.readFileSync(`${wsPath}/defaultCfg.json`, 'utf8');
  const settings = JSON.parse(cfgData);
  const newWsConfig: any = {};
  newWsConfig.TOKEN = settings.TOKEN || '';
  newWsConfig.SCAN_MODE = settings.SCAN_MODE || 'FULL_SCAN';
  newWsConfig.DEFAULT_API_INDEX = settings.DEFAULT_URL_API;
  newWsConfig.APIS = [];
  newWsConfig.VERSION = app.isPackaged === true ? app.getVersion() : packageJson.version;
  for (let i = 0; i < settings.AVAILABLE_URL_API.length; i += 1) {
    const aux: any = {};
    aux.URL = settings.AVAILABLE_URL_API[i];
    aux.API_KEY = '';
    aux.DESCRIPTION = '';
    newWsConfig.APIS.push(aux);
  }
  fs.writeFileSync(`${wsPath}/workspaceCfg.json`, JSON.stringify(newWsConfig, undefined, 2), 'utf8');
  fs.unlinkSync(`${wsPath}/defaultCfg.json`);
}
