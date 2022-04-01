/* eslint-disable global-require */
import { AppConfigDefault } from './AppConfigDefault';
import { IAppConfig } from './IAppConfig';

let conf = AppConfigDefault;

try {
  const overrideConf = require('./override.conf.json');
  conf = { ...conf, ...overrideConf };
} catch (e) {
  console.log('No override config found');
}

const AppConfig: IAppConfig = conf;

export default AppConfig;
