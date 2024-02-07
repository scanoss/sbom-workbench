import '../api/handlers/inventory.handler';
import '../api/handlers/component.handler';
import '../api/handlers/project.handler';
import '../api/handlers/results.handler';
import '../api/handlers/file.hanlder';
import '../api/handlers/formats.handler';
import '../api/handlers/workspace.handler';
import '../api/handlers/report.handler';
import '../api/handlers/license.handler';
import '../api/handlers/dependency.handler';
import '../api/handlers/userSetting.handler';
import '../api/handlers/app.handler';
import '../api/handlers/search.handler';
import '../api/handlers/vulnerability.handler';
import '../api/handlers/cryptography.handler';
import { IpcChannels } from '../api/ipc-channels';
import api from '../api/api';
import { ProjectAccessMode } from '@api/types';

// Example how to use a middleware
api.use(IpcChannels.PROJECT_OPEN_SCAN, (event, path: string, mode: ProjectAccessMode) => console.log('Running middleware before opening project'));

api.use(IpcChannels.PROJECT_CURRENT_CLOSE, () => console.log('Running middleware before closing project'));
