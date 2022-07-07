import fs from 'fs';
import log from 'electron-log';
import { IIndexer } from './IIndexer';
import { IpcEvents } from "../../../../api/ipc-events";
import { getSearchConfig } from '../../../../shared/utils/search-utils';
import { broadcastManager } from "../../../broadcastManager/BroadcastManager";

const { Index } = require('flexsearch');

export class Indexer {

  public index(files: Array<IIndexer>) {
    const index = new Index(getSearchConfig());
    for (let i = 0; i < files.length; i += 1) {
      try {
        if (i % 100 === 0) {
          this.sendToUI(IpcEvents.SCANNER_UPDATE_STATUS, {
            stage: {
              stageName: `Creating search index`,
              stageStep: 3,
            },
            processed: i*100/files.length,
          });
        }
        const fileContent = fs.readFileSync(files[i].path, 'utf-8');
        index.add(files[i].fileId, fileContent);
      } catch (e) {
        log.error(e);
      }
    }
    return index;
  }

  public async saveIndex(index: any, pathToDictionary: string) {
    if (fs.existsSync(pathToDictionary)) {
      fs.rmdirSync(pathToDictionary, { recursive: true });
      fs.rm(pathToDictionary, { recursive:true }, (err) => {
        log.error(err);
      })
    }
    fs.mkdirSync(pathToDictionary);
    await index.export((key: any, data: string | NodeJS.ArrayBufferView) => {
      fs.writeFile(`${pathToDictionary}${key}.json`, data !== undefined ? data : '', (err) => {
        if (err) console.log(err);
      });
    });
  }

  private sendToUI(eventName, data: any) {
    broadcastManager.get().send(eventName,data)
  }
}
