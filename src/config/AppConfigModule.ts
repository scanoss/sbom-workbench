/* eslint-disable no-console */
/* eslint-disable no-empty */
/* eslint-disable global-require */
import { AppConfigDefault } from './AppConfigDefault';
import { IAppConfig } from './IAppConfig';

let conf = AppConfigDefault;
let overrideConf = {};

console.info('%c[ CONFIGMODULE ]: Applying config override', 'color: yellow');
try {
  overrideConf = require('./override.json');
} catch (e) {
  console.info('%c[ CONFIGMODULE ]: Missing override.json file', 'color: red');
}

conf = { ...conf, ...overrideConf };
const AppConfig: IAppConfig = conf;

export default AppConfig;
