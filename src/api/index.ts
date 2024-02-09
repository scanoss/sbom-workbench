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
import { accessMiddleware } from './middlewares/access.middleware';
import { IpcChannels } from './ipc-channels';
import api from './api';
import { lockMiddleware } from './middlewares/lock.middleware';
import { unlockMiddleware } from './middlewares/unlock.middleware';

// Example how to use a middleware
// Disclaimer: Payload must be an object in order to modify the data on the middleware
api.use(IpcChannels.PROJECT_OPEN_SCAN, () => unlockMiddleware());

/* eslint-disable */
[IpcChannels.PROJECT_OPEN_SCAN, IpcChannels.PROJECT_RESUME_SCAN, IpcChannels.PROJECT_RESCAN].forEach((c) => api.use(c, (_, payload) => lockMiddleware(payload)));

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
].forEach((c) => api.use(c, () => accessMiddleware()));
