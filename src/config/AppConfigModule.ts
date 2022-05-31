/* eslint-disablelocaleText={{
          footerTotalVisibleRows: (visibleCount, totalCount) =>
            `${visibleCount.toLocaleString()} / ${totalCount.toLocaleString()}does nothing`,
          MuiTablePagination: {
            labelDisplayedRows: ({ from, to, count }) =>
              `${from} - ${to} of more than ${to}`,
          },
        }} global-require */
import log from 'electron-log';
import { AppConfigDefault } from './AppConfigDefault';
import { IAppConfig } from './IAppConfig';

let conf = AppConfigDefault;

try {
  const overrideConf = require('./override.conf.json');
  conf = { ...conf, ...overrideConf };
  log.info(`%c[ CONFIGMODULE ]: Override config file found`, 'color: yellow');
  // eslint-disable-next-line no-empty
} catch (e) {}

const AppConfig: IAppConfig = conf;

export default AppConfig;
