import fs from 'fs';
import log from 'electron-log';
import { getHeapStatistics } from 'node:v8';
import path from 'path';
import { IIndexer } from './IIndexer';
import { IpcChannels } from '../../../../api/ipc-channels';
import { getSearchConfig, SEARCH_INDEX_VERSION, SEARCH_INDEX_VERSION_FILE } from '../../../../shared/utils/search-utils';
import { broadcastManager } from '../../../broadcastManager/BroadcastManager';
import { readTextFile } from '../../../utils/utils';

const { Index } = require('flexsearch');

const BYTES_PER_MB = 1024 * 1024;

export class Indexer {
  private MAX_FILE_SIZE_MB = 100;

  private shouldStopIndexing(): boolean {
    const HEAP_BUFFER_MB = 200;
    const MAX_HEAP_SIZE_MB = getHeapStatistics().heap_size_limit / BYTES_PER_MB;
    const currentHeapMB = process.memoryUsage().heapUsed / BYTES_PER_MB;

    return (MAX_HEAP_SIZE_MB - currentHeapMB) < HEAP_BUFFER_MB;
  }

  public async index(files: Array<IIndexer>, basePath: string) {
    const index = new Index(getSearchConfig());
    for (let i = 0; i < files.length; i += 1) {
      if (i % 100 === 0) {
        this.sendToUI(IpcChannels.SCANNER_UPDATE_STATUS, {
          processed: (i * 100) / files.length,
        });
      }
      if (this.shouldStopIndexing()) {
        log.warn(`[ Indexer ]: heap limit reached, ${files.length - i} files were not indexed`);
        break;
      }
      try {
        const absoluteFilePath = path.join(basePath, files[i].path);
        const fileSizeMB = (await fs.promises.stat(absoluteFilePath)).size / BYTES_PER_MB;
        if (fileSizeMB > this.MAX_FILE_SIZE_MB) {
          log.warn(`[ Indexer ]: skipping large file ${files[i].path} (${fileSizeMB.toFixed(2)}MB)`);
          // eslint-disable-next-line no-continue
          continue;
        }
        const content = readTextFile(absoluteFilePath);
        if (content !== null) index.add(files[i].fileId, content);
      } catch (e) {
        log.error(e);
      }
    }
    return index;
  }

  public async saveIndex(index: any, pathToDictionary: string) {
    // Written aside and swapped in, so a failed or interrupted save never replaces the current dictionary.
    const dictionaryPath = pathToDictionary.replace(/[\\/]+$/, '');
    this.removeOrphanTmpFolders(dictionaryPath);
    const tmpPath = `${dictionaryPath}.${process.pid}-${Date.now()}.tmp`;
    fs.mkdirSync(tmpPath);
    const writes: Promise<void>[] = [];
    await index.export((key: any, data: string | NodeJS.ArrayBufferView) => {
      writes.push(fs.promises.writeFile(path.join(tmpPath, `${key}.json`), data !== undefined ? data : ''));
    });
    await Promise.all(writes);
    await fs.promises.writeFile(
      path.join(tmpPath, SEARCH_INDEX_VERSION_FILE),
      JSON.stringify({ version: SEARCH_INDEX_VERSION }),
    );
    fs.rmSync(pathToDictionary, { recursive: true, force: true });
    fs.renameSync(tmpPath, pathToDictionary);
  }

  /**
   * Removes temp folders left by a crashed save of a previous app run. This process's
   * folders may belong to a save still in progress, so they are kept.
   */
  private removeOrphanTmpFolders(dictionaryPath: string) {
    const parent = path.dirname(dictionaryPath);
    const prefix = `${path.basename(dictionaryPath)}.`;
    const ownPrefix = `${prefix}${process.pid}-`;
    fs.readdirSync(parent)
      .filter((f) => f.startsWith(prefix) && f.endsWith('.tmp') && !f.startsWith(ownPrefix))
      .forEach((f) => fs.rmSync(path.join(parent, f), { recursive: true, force: true }));
  }

  private sendToUI(eventName, data: any) {
    broadcastManager.get().send(eventName, data);
  }
}
