import './handlers/inventory.handler';
import './handlers/component.handler';
import './handlers/project.handler';
import './handlers/results.handler';
import './handlers/file.hanlder';
import './handlers/formats.handler';
import './handlers/workspace.handler';
import './handlers/report.handler';
import './handlers/license.handler';
import './handlers/dependency.handler';
import './handlers/userSetting.handler';
import './handlers/app.handler';
import './handlers/search.handler';
import './handlers/vulnerability.handler';
import './handlers/cryptography.handler';
import fs from 'fs';
import { accessMiddleware } from './middlewares/access.middleware';
import { IpcChannels } from './ipc-channels';
import api from './api';
import { lockMiddleware } from './middlewares/lock.middleware';
import { unlockMiddleware } from './middlewares/unlock.middleware';
import { refreshMiddleware } from './middlewares/refresh.middleware';
import { projectOpenPermissionsMiddleware } from './middlewares/project.open.permissions.middleware';
import { projectPermissionsMiddleware } from './middlewares/project.permissions.middleware';
import { wsPermissionsMiddleware } from './middlewares/ws.permissions.middleware';

// Example how to use a middleware
// api.use(IpcChannels.PROJECT_OPEN_SCAN, (_, payload) => permissionsMiddleware(payload));
// api.use(IpcChannels.PROJECT_OPEN_SCAN, () => unlockMiddleware());

// Disclaimer: Payload must be an object in order to modify the data on the middleware
/* eslint-disable */
[
  IpcChannels.PROJECT_OPEN_SCAN, 
  IpcChannels.PROJECT_RESUME_SCAN, 
  IpcChannels.PROJECT_RESCAN
].forEach((c) => {
    api.use(c, () => wsPermissionsMiddleware());
    api.use(c,(_, payload) => projectOpenPermissionsMiddleware(payload));
    api.use(c, () => unlockMiddleware());
    api.use(c, (_, payload) => lockMiddleware(payload));
  
  });

api.use(IpcChannels.PROJECT_CREATE, () => wsPermissionsMiddleware());
api.use(IpcChannels.PROJECT_CREATE, (_, payload) => lockMiddleware({ path: payload.name }));

api.use(IpcChannels.PROJECT_CURRENT_CLOSE, () => unlockMiddleware());

/* eslint-disable */
[
  IpcChannels.COMPONENT_CREATE,
  IpcChannels.COMPONENT_DELETE,
  IpcChannels.PROJECT_EXTRACT_INVENTORY_KNOWLEDGE,
  IpcChannels.PROJECT_ACCEPT_INVENTORY_KNOWLEDGE,
  IpcChannels.INVENTORY_CREATE,
  IpcChannels.INVENTORY_DELETE,
  IpcChannels.INVENTORY_UPDATE,
  IpcChannels.INVENTORY_ATTACH_FILE,
  IpcChannels.INVENTORY_DETACH_FILE,
  IpcChannels.INVENTORY_FROM_COMPONENT,
  IpcChannels.INVENTORY_BATCH,
  IpcChannels.COMPONENT_CREATE,
  IpcChannels.COMPONENT_DELETE,
  IpcChannels.COMPONENT_UPDATE,
  IpcChannels.COMPONENT_ATTACH_LICENSE,
  IpcChannels.COMPONENT_DETACH_LICENSE,
  IpcChannels.CRYPTOGRAPHY_UPDATE,
  IpcChannels.LICENSE_CREATE,
  IpcChannels.LICENSE_DELETE,
  IpcChannels.LICENSE_UPDATE,
  IpcChannels.DEPENDENCY_ACCEPT,
  IpcChannels.DEPENDENCY_RESTORE_ALL,
  IpcChannels.DEPENDENCY_RESTORE,
  IpcChannels.DEPENDENCY_ACCEPT_ALL,
  IpcChannels.DEPENDENCY_REJECT,
  IpcChannels.DEPENDENCY_REJECT_ALL,
  IpcChannels.VULNERABILITY_UPDATE,
].forEach((c) => {
  api.use(c, () => wsPermissionsMiddleware());
  api.use(c, () => projectPermissionsMiddleware(fs.constants.W_OK | fs.constants.X_OK));
  api.use(c, () => accessMiddleware());
  api.use(c, () => refreshMiddleware());
});


[
  IpcChannels.UTILS_GET_PROJECT_DTO,
  IpcChannels.UTILS_GET_NODE_FROM_PATH,
  IpcChannels.GET_LICENSES,
  IpcChannels.INVENTORY_GET,
  IpcChannels.INVENTORY_GET_ALL,
  IpcChannels.INVENTORY_GET_ALL_BY_FILE,
  IpcChannels.COMPONENT_GET_FILES,
  IpcChannels.COMPONENT_GET_ALL,
  IpcChannels.COMPONENT_GET,
  IpcChannels.COMPONENT_GET_GLOBAL_COMPONENTS,
  IpcChannels.COMPONENT_GET_GLOBAL_COMPONENT_VERSION,
  IpcChannels.LICENSE_GET,
  IpcChannels.LICENSE_GET_ALL,
  IpcChannels.FILE_GET_CONTENT,
  IpcChannels.FILE_GET,
  IpcChannels.RESULTS_GET,
  IpcChannels.DEPENDENCY_GET_ALL,
  IpcChannels.VULNERABILITY_GET_ALL,
].forEach((c) => {
  api.use(c, () => wsPermissionsMiddleware());
  api.use(c, () => projectPermissionsMiddleware(fs.constants.R_OK));
 });