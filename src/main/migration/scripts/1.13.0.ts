import log from 'electron-log';
import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { CryptoCfg, CryptographyScanner } from 'scanoss';
import { modelProvider } from '../../services/ModelProvider';

export async function projectMigration1130(projectPath: string): Promise<void> {
  log.info('%cProject migration 1.13.0 in progress...', 'color:green');
  modelProvider.openModeProjectModel = sqlite3.OPEN_READWRITE;
  await modelProvider.init(projectPath);
  await addLocalCrypto(projectPath);
  log.info('%cProject migration 1.13.0 finished', 'color:green');
}

async function addLocalCrypto(projectPath: string) {
  const m = await fs.promises.readFile(path.join(projectPath, 'metadata.json'), 'utf-8');
  const metadata = JSON.parse(m);
  const files = await modelProvider.model.file.getAll();
  const filesToSearchCrypto = files
    .filter((f) => f.type !== 'FILTERED')
    .map((f) => { return path.join(metadata.scan_root, f.path); });

  const cryptoCfg = new CryptoCfg(null);
  const cryptoScanner = new CryptographyScanner(cryptoCfg);
  const response = await cryptoScanner.scan(filesToSearchCrypto);

  const fileIdMapper = new Map<string, number>();
  files.forEach((f) => { fileIdMapper.set(f.path, f.id); });

  // Get those files with crypto local results
  const filesWithCrypto = response.fileList.filter((ci) => ci.algorithms.length > 0);
  filesWithCrypto.forEach((ci) => { ci.file = path.join('/', path.relative(metadata.scan_root, ci.file)); });

  // Convert file paths to fileIds
  const localCrypto = filesWithCrypto.map((fc) => { return { fileId: fileIdMapper.get(fc.file), algorithms: JSON.stringify(fc.algorithms) }; });

  // Import results of local cryprography
  await modelProvider.model.localCryptography.import(localCrypto);

  await modelProvider.model.destroy();
}
