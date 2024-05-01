import log from 'electron-log';
import i18next from 'i18next';
import { CryptographyScanner, CryptoCfg } from 'scanoss';
import path from 'path';
import { Project } from '../../../workspace/Project';
import { Scanner } from '../types';
import { ScannerStage } from '../../../../api/types';

export class LocalCryptographyTask implements Scanner.IPipelineTask {
  private project: Project;

  constructor(project: Project) {
    this.project = project;
  }

  public getStageProperties():Scanner.StageProperties {
    return {
      name: ScannerStage.LOCAL_CRYPTOGRAPHY,
      label: i18next.t('Title:AnalyzingCryptography'),
      isCritical: false,
    };
  }

  public async run():Promise<boolean> {
    try {
      console.log('LocalCryptographyTask init');
      let rules = null;
      const rootFolder = this.project.getTree().getRootFolder();
      if (rootFolder.containsFile('scanoss-crypto-rules.json')) {
        rules = path.join(this.project.getScanRoot(), 'scanoss-crypto-rules.json');
      }
      const cryptoCfg = new CryptoCfg(rules);
      const cryptoScanner = new CryptographyScanner(cryptoCfg);
      const allFiles = this.project.getTree().getRootFolder().getFiles();
      const files = [];
      allFiles.forEach((f) => {
        if (f.type !== 'FILTERED') files.push(path.join(this.project.getScanRoot(), f.path));
      });
      const localCryptography = await cryptoScanner.scan(files);
      
      console.log(localCryptography.cryptoItems);

      console.log('CRYPTO', JSON.stringify(localCryptography, null, 2));

      return true;
    } catch (e) {
      return false;
    }
  }
}
