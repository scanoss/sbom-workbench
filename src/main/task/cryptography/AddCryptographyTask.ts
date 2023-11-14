import log from 'electron-log';
import AppConfig from '../../../config/AppConfigModule';
import { ITask } from '../Task';

export class AddCryptographyTask implements ITask<Array<string>, void> {
  async run(components: Array<string>): Promise<void> {
    try {
      if (!AppConfig.FF_ENABLE_SCAN_CRYPTOGRAPHY) return;

      const reqData = {
        purls: components.map((item) => {
          const component = item.split('@');
          return { purl: component[0], requirement: component[1] ?? undefined };
        }),
      };

    } catch (e) {
      log.error(e);
    }
  }
}
