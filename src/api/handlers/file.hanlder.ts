import log from 'electron-log';
import * as fs from 'fs';
import api from '../api';
import { GetFileDTO } from '@api/dto';
import { IpcChannels } from '../ipc-channels';
import { FileType } from '../types';
import { workspace } from '../../main/workspace/Workspace';
import { NodeStatus } from '../../main/workspace/tree/Node';
import { utilHelper } from '../../main/helpers/UtilHelper';
import { FilterTrue } from '../../main/batch/Filter/FilterTrue';
import { resultService } from '../../main/services/ResultService';
import { fileService } from '../../main/services/FileService';
import { Response, ResponseStatus } from '../Response';
import { broadcastManager } from '../../main/broadcastManager/BroadcastManager';

const path = require('path');
const isBinaryPath = require('is-binary-path');

function isAllowed(filePath: string) {
  const skip = new Set([
    '.exe',
    '.zip',
    '.tar',
    '.tgz',
    '.gz',
    '.7z',
    '.rar',
    '.jar',
    '.war',
    '.ear',
    '.class',
    '.pyc',
    '.o',
    '.a',
    '.so',
    '.obj',
    '.dll',
    '.lib',
    '.out',
    '.app',
    '.bin',
    '.lst',
    '.dat',
  ]);

  // Filter by extension
  const ext = path.extname(filePath);
  if (skip.has(ext)) {
    return false;
  }

  // if binary
  if (isBinaryPath(filePath)) {
    return false;
  }

  return true;
}

api.handle(IpcChannels.FILE_GET_CONTENT, async (_event, filePath: string) => {
  const fileContent = { content: null };
  try {
    if (!isAllowed(filePath)) {
      fileContent.content = FileType.BINARY;
    } else {
      const file = fs.readFileSync(filePath).toString();
      fileContent.content = file;
    }
    return {
      status: 'ok',
      message: 'File content retrieved',
      data: fileContent,
    };
  } catch (error: any) {
    console.log('Error on file get content: ', error);
    return Response.fail({ message: error.message });
  }
});

api.handle(IpcChannels.FILE_GET, async (_event, params: GetFileDTO) => {
  try {
    const data = await fileService.get(params);
    return Response.ok({ message: 'File retrieve successfully', data });
  } catch (error: any) {
    log.error('[ IGNORE FILES ]:', error, params);
    return Response.fail({ message: error.message });
  }
});

api.handle(IpcChannels.IGNORED_FILES, async (_event, arg: number[]) => {
  try {
    const project = workspace.getOpenedProjects()[0];
    const data = await fileService.ignore(arg);
    broadcastManager.get().send(IpcChannels.TREE_UPDATING, {});
    resultService
      .getResultsFromIDs(arg)
      .then((filesToUpdate: any) => {
        const paths = utilHelper.getArrayFromObjectFilter(filesToUpdate, 'path', new FilterTrue()) as Array<string>;
        for (const filePath of paths) {
          project.getTree().getRootFolder().setStatus(filePath, NodeStatus.IGNORED);
        }
        project.updateTree();
        return true;
      })
      .catch((e) => {
        // TODO: project.getTree().sendToUI(IpcChannels.TREE_UPDATING_ERROR);
        log.error('[ IGNORE FILES UPDATE STATUS ]:', e);
      });
    return Response.ok({ message: 'Files successfully ignored', data });
  } catch (error: any) {
    log.error('[ IGNORE FILES ]:', error, arg);
    return Response.fail({ message: 'Ignore file service' });
  }
});
