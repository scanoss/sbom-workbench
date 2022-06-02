import fs from 'fs';
import log from 'electron-log';
import { EventEmitter } from "events";
import { IIndexer } from './IIndexer';
import { IpcEvents } from "../../../../api/ipc-events";
import { getSearchConfig } from '../../../../shared/utils/search-utils';

const path = require('path');
const { Index } = require('flexsearch');

export class Indexer extends  EventEmitter{

  private msgToUI: Electron.WebContents;

  constructor(msgToUI?: Electron.WebContents) {
    super();
    this.msgToUI = msgToUI;
  }

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
    if (!fs.existsSync(pathToDictionary)) {
      fs.rmdir(pathToDictionary, { recursive: true }, (err) => {
      });
    }
    fs.mkdirSync(pathToDictionary);
    await index.export((key: any, data: string | NodeJS.ArrayBufferView) => {
      fs.writeFile(`${pathToDictionary}${key}.json`, data !== undefined ? data : '', (err) => {
        if (err) console.log(err);
      });
    });
  }

  private sendToUI(eventName, data: any) {
    if (this.msgToUI) this.msgToUI.send(eventName, data);
  }
}
