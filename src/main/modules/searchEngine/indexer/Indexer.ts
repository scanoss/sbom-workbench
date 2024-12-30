import fs from 'fs';
import log from 'electron-log';
import { getHeapStatistics } from 'node:v8';
import { IIndexer } from './IIndexer';
import { IpcChannels } from '../../../../api/ipc-channels';
import { getSearchConfig } from '../../../../shared/utils/search-utils';
import { broadcastManager } from '../../../broadcastManager/BroadcastManager';

const { Index } = require('flexsearch');

export class Indexer {
  private MAX_FILE_SIZE_MB = 100;

  private shouldStopIndexing(): boolean {
    const HEAP_BUFFER_MB = 200;
    const MAX_HEAP_SIZE_MB = getHeapStatistics().heap_size_limit / (1024 * 1024);
    const currentHeapMB = process.memoryUsage().heapUsed / (1024 * 1024);

    return (MAX_HEAP_SIZE_MB - currentHeapMB) < HEAP_BUFFER_MB;
  }

  private async getFileSizeMB(path: string): Promise<number> {
    try {
      const stats = await fs.promises.stat(path);
      return stats.size / (1024 * 1024);
    } catch (e) {
      console.error(`Error getting file size for ${path}:`, e);
      return 0;
    }
  }

  public async index(files: Array<IIndexer>) {
    const index = new Index(getSearchConfig());
    for (let i = 0; i < files.length; i += 1) {
      try {
        if (i % 100 === 0) {
          this.sendToUI(IpcChannels.SCANNER_UPDATE_STATUS, {
            processed: i * 100 / files.length,
          });
        }

        // Check file size first
        const fileSizeMB = await this.getFileSizeMB(files[i].path);
        if (fileSizeMB > this.MAX_FILE_SIZE_MB) {
          console.warn(`Skipping large file: ${files[i].path} (${fileSizeMB.toFixed(2)}MB)`);
          // eslint-disable-next-line no-continue
          continue;
        }

        if (this.shouldStopIndexing()) {
          log.info('Skipping file indexing, maximum heap size exceeded');
        } else {
          const fileContent = fs.readFileSync(files[i].path, 'utf-8');
          index.add(files[i].fileId, fileContent);
        }
      } catch (e) {
        log.error(e);
      }
    }
    return index;
  }

  public async saveIndex(index: any, pathToDictionary: string) {
    if (fs.existsSync(pathToDictionary)) {
      fs.rmSync(pathToDictionary, { recursive: true, force: true });
    }
    fs.mkdirSync(pathToDictionary);
    await index.export((key: any, data: string | NodeJS.ArrayBufferView) => {
      fs.writeFile(`${pathToDictionary}${key}.json`, data !== undefined ? data : '', (err) => {
        if (err) console.log(err);
      });
    });
  }

  private sendToUI(eventName, data: any) {
    broadcastManager.get().send(eventName, data);
  }
}
