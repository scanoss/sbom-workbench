/* eslint-disable global-require */
import log from 'electron-log';
import { AppConfigDefault } from './AppConfigDefault';
import { IAppConfig } from './IAppConfig';

let conf = AppConfigDefault;

try {
  const overrideConf = require('./override.conf.json');
  conf = { ...conf, ...overrideConf };
} catch (e) {
  log.info(`%c[ CONFIGMODULE ]: No override config found`, 'color: yellow');
}

const AppConfig: IAppConfig = conf;

export default AppConfig;
