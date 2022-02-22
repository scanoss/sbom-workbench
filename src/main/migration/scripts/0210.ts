import sqlite3 from 'sqlite3';
import log from 'electron-log';
import { Metadata } from '../../workspace/Metadata';

export async function metadataMigration0210(projectPath): Promise<void> {
  log.info('%c[ MIGRATION ] IN PROGRESS...', 'color: green');

  try {
    const mt = await Metadata.readFromPath(projectPath);
    mt.setSource('LOCAL');
    mt.save();
  } catch (e) {
    log.error(e);
    throw e;
  }
}
