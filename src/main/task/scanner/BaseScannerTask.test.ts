import { EventEmitter } from 'events';
import { ScannerEvents } from 'scanoss';
import { ScannerStage } from '../../../api/types';

jest.mock('../../services/UserSettingService', () => ({
  userSettingService: {
    get: jest.fn(() => ({
      DEFAULT_API_INDEX: 0,
      APIS: [{ URL: 'https://api.example.com', API_KEY: 'key' }],
      HTTP_PROXY: '',
      HTTPS_PROXY: '',
      PAC_PROXY: '',
      GRPC_PROXY: '',
      NO_PROXY: [],
      CA_CERT: '',
      IGNORE_CERT_ERRORS: false,
      SCANNER_TIMEOUT: 300,
      SCANNER_POST_SIZE: 16,
      SCANNER_CONCURRENCY_LIMIT: 5,
    })),
  },
}));

jest.mock('../../../config/AppConfigModule', () => ({
  __esModule: true,
  default: {
    FF_ENABLE_AUTO_ACCEPT_AFTER_SCAN: false,
  },
}));

jest.mock('../inventory/AutoAccept', () => ({
  AutoAccept: class {
    // eslint-disable-next-line @typescript-eslint/require-await
    async run() {}
  },
}));

jest.mock('../import/ImportTask', () => ({
  ImportTask: class {
    // eslint-disable-next-line @typescript-eslint/require-await
    async run() {}
  },
}));

import { BaseScannerTask } from './BaseScannerTask';
import { broadcastManager } from '../../broadcastManager/BroadcastManager';

class TestScannerTask extends BaseScannerTask<any, any> {
  private emitter: EventEmitter;

  constructor(project: any, emitter: EventEmitter) {
    super(project, { dispatch: jest.fn() } as any, {} as any);
    this.emitter = emitter;
  }

  public getStageProperties() {
    return {
      name: ScannerStage.SCAN,
      label: 'scan',
      isCritical: true,
    };
  }

  public async set(): Promise<void> {}

  // eslint-disable-next-line @typescript-eslint/require-await
  protected async setScannerConfig() {
    this.scanner = this.emitter as any;
    this.project.scanner = this.scanner;
  }
}

describe('BaseScannerTask save throttling', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    broadcastManager.set({ send: jest.fn() } as any);
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  const createProjectMock = () => ({
    metadata: {
      setSource: jest.fn(),
    },
    filesSummary: {
      include: 20,
    },
    processedFiles: 0,
    filesNotScanned: {},
    save: jest.fn(),
    close: jest.fn().mockResolvedValue(undefined),
  });

  it('coalesces multiple RESULTS_APPENDED events into one save per throttle window', async () => {
    const emitter = new EventEmitter();
    const project: any = createProjectMock();
    const task = new TestScannerTask(project, emitter);

    await task.init();

    emitter.emit(ScannerEvents.RESULTS_APPENDED, { getNumberOfFilesScanned: () => 1 }, {});
    emitter.emit(ScannerEvents.RESULTS_APPENDED, { getNumberOfFilesScanned: () => 1 }, {});
    emitter.emit(ScannerEvents.RESULTS_APPENDED, { getNumberOfFilesScanned: () => 1 }, {});

    expect(project.save).toHaveBeenCalledTimes(0);

    jest.advanceTimersByTime(9_999);
    expect(project.save).toHaveBeenCalledTimes(0);

    jest.advanceTimersByTime(1);
    expect(project.save).toHaveBeenCalledTimes(1);
  });

  it('flushes pending save on SCAN_DONE without waiting for the timer', async () => {
    const emitter = new EventEmitter();
    const project: any = createProjectMock();
    const task = new TestScannerTask(project, emitter);

    await task.init();

    emitter.emit(ScannerEvents.RESULTS_APPENDED, { getNumberOfFilesScanned: () => 1 }, {});
    emitter.emit(ScannerEvents.SCAN_DONE, '/tmp/result.json', {});

    expect(project.save).toHaveBeenCalledTimes(1);

    jest.runOnlyPendingTimers();
    expect(project.save).toHaveBeenCalledTimes(1);
  });

  it('flushes pending save on scanner error and closes project', async () => {
    const emitter = new EventEmitter();
    const project: any = createProjectMock();
    const task = new TestScannerTask(project, emitter);

    await task.init();

    emitter.emit(ScannerEvents.RESULTS_APPENDED, { getNumberOfFilesScanned: () => 1 }, {});
    emitter.emit('error', new Error('boom'));
    await Promise.resolve();

    expect(project.save).toHaveBeenCalledTimes(1);
    expect(project.close).toHaveBeenCalledTimes(1);
  });
});
