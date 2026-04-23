/**
 * Module-level mocks for integration tests.
 *
 * Imported with side effects by ./harness, which is in turn imported by
 * every integration test file. The `jest.mock()` calls here register the
 * stubs in Jest's module registry before any production module is required,
 * so when services later evaluate their imports of `electron`, `scanoss`,
 * etc., they get these stubs.
 *
 * Keep this file free of imports that touch production modules.
 */

import { writeFileSync } from 'fs';
import { join } from 'path';
import type { ComponentMatch } from './components';
import { buildResultEntry } from './components';

// --- electron --------------------------------------------------------------

jest.mock('electron', () => ({
  app: {
    getPath: jest.fn(() => '/tmp/mock'),
    getName: jest.fn(() => 'MockApp'),
    getVersion: jest.fn(() => '1.0.0'),
  },
  ipcMain: { on: jest.fn(), handle: jest.fn(), send: jest.fn() },
}));

jest.mock('electron-log', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  transports: { file: { resolvePath: jest.fn() } },
}));

// --- broadcastManager ------------------------------------------------------

jest.mock('../../../main/broadcastManager/BroadcastManager', () => ({
  broadcastManager: { get: () => ({ send: jest.fn() }) },
}));

// --- workspace -------------------------------------------------------------
// ScannerFactory.buildConfig calls workspace.getOpenProject() to resolve
// per-project API credentials. Tests don't register a project with the
// workspace singleton, so return an empty stub — the defaults from
// userSettingService fill in the rest of the config.

jest.mock('../../../main/workspace/Workspace', () => ({
  workspace: {
    getOpenProject: () => ({ getApi: () => '', getApiKey: () => '' }),
    getOpenedProjects: () => [],
  },
}));

// --- userSettingService ----------------------------------------------------
//
// Various tasks read user-level config (proxy, API key, scanner timeouts).
// Return a minimal but complete shape so they don't NPE.

jest.mock('../../../main/services/UserSettingService', () => ({
  userSettingService: {
    get: jest.fn(() => ({
      DEFAULT_API_INDEX: 0,
      APIS: [{ URL: 'http://mock', API_KEY: '', DESCRIPTION: null }],
      WORKSPACES: [{ SCAN_SOURCES: '/tmp', PATH: '/tmp' }],
      HTTP_PROXY: null,
      HTTPS_PROXY: null,
      PAC_PROXY: null,
      NO_PROXY: null,
      CA_CERT: null,
      IGNORE_CERT_ERRORS: false,
      SCANNER_TIMEOUT: 300,
      SCANNER_POST_SIZE: 16,
      SCANNER_CONCURRENCY_LIMIT: 5,
      TOKEN: null,
    })),
  },
}));

// --- scanoss engine --------------------------------------------------------
//
// Each TestContext writes its own scan spec into a global registry keyed by
// the project's workDir (which is unique per ctx via mkdtempSync). When the
// production code calls Scanner.setWorkDirectory(dir) followed by Scanner.scan(),
// the mock looks up the spec by that dir and writes result.json.
//
// jest.mock() forces this state to live at module level — the mock factory
// captures one closure that is reused across every `import 'scanoss'`. We
// can't move the registry into the ctx object itself, but we can scope each
// ctx's *entry* in the registry by its workDir.

export type ScanSpec = Record<string, ComponentMatch | ComponentMatch[] | 'none'>;

const _scanSpecsByDir = new Map<string, ScanSpec>();
let _currentWorkDir: string | null = null;

/** Per-ctx setter. Called from ctx.mockScanResults. */
export function setSpecForDir(dir: string, spec: ScanSpec): void {
  _scanSpecsByDir.set(dir, spec);
}

/** Per-ctx cleanup. Called from ctx.destroy. */
export function clearSpecForDir(dir: string): void {
  _scanSpecsByDir.delete(dir);
}

export function setCurrentWorkDir(dir: string): void {
  _currentWorkDir = dir;
}

/** Reset the call-count counter on the scanner mock between ctx setups. */
export function resetScannerMockCalls(): void {
  scannerScanMock.mockClear();
}

function normalizePath(p: string): string {
  return p.startsWith('/') ? p : `/${p}`;
}

/** Server metadata the real SCANOSS engine returns on every entry (match or none). */
const SERVER_META = {
  elapsed: '0.000s',
  flags: '0',
  hostname: 'test-mock',
  kb_version: { daily: '26.04.21', monthly: '26.03' },
  version: '5.4.25',
};

function buildResultJson(spec: ScanSpec): Record<string, Array<Record<string, unknown>>> {
  const result: Record<string, Array<Record<string, unknown>>> = {};
  for (const [path, value] of Object.entries(spec)) {
    const key = normalizePath(path);
    if (value === 'none') {
      result[key] = [{ id: 'none', server: SERVER_META }];
    } else {
      const matches = Array.isArray(value) ? value : [value];
      result[key] = matches.map((m) => buildResultEntry(key, m));
    }
  }
  return result;
}

export const scannerScanMock = jest.fn(async (..._args: any[]) => {
  if (!_currentWorkDir) {
    throw new Error('Scanner.setWorkDirectory was never called');
  }
  const spec = _scanSpecsByDir.get(_currentWorkDir);
  if (!spec) {
    throw new Error(
      `No scan spec for workDir ${_currentWorkDir} — call ctx.mockScanResults() first`,
    );
  }
  const resultPath = join(_currentWorkDir, 'result.json');
  writeFileSync(resultPath, JSON.stringify(buildResultJson(spec), null, 2));
  return resultPath;
});

import type { DependencyMatch } from './dependencies';
import { buildDependencyEntry } from './dependencies';

export type DependencyScanSpec = Record<string, DependencyMatch | DependencyMatch[]>;

const _dependencyScanSpecsByRoot = new Map<string, DependencyScanSpec>();

export function setDependencyScanSpecForRoot(root: string, spec: DependencyScanSpec): void {
  _dependencyScanSpecsByRoot.set(root, spec);
}

export function clearDependencyScanSpecForRoot(root: string): void {
  _dependencyScanSpecsByRoot.delete(root);
}

function buildDependencyResponse(rootPath: string, spec: DependencyScanSpec) {
  const filesList = Object.entries(spec).map(([path, value]) => {
    const matches = Array.isArray(value) ? value : [value];
    const absPath = path.startsWith('/') ? rootPath + path : `${rootPath}/${path}`;
    return {
      file: absPath,
      id: 'manifest',
      status: 'ok',
      dependenciesList: matches.map(buildDependencyEntry),
    };
  });
  return { filesList, status: { status: 'SUCCESS', message: 'ok' } };
}

export const dependencyScanMock = jest.fn(async (_files: string[], rootPath: string) => {
  const spec = _dependencyScanSpecsByRoot.get(rootPath);
  if (!spec) return { filesList: [], status: { status: 'SUCCESS', message: 'ok' } };
  return buildDependencyResponse(rootPath, spec);
});

jest.mock('scanoss', () => ({
  Scanner: jest.fn().mockImplementation(() => ({
    scan: scannerScanMock,
    on: jest.fn(),
    setWorkDirectory: jest.fn((dir: string) => {
      setCurrentWorkDir(dir);
    }),
  })),
  ScannerCfg: jest.fn(),
  DependencyScanner: jest.fn().mockImplementation(() => ({
    scan: dependencyScanMock,
  })),
  DependencyScannerCfg: jest.fn(),
  CryptographyScanner: jest.fn().mockImplementation(() => ({
    scanFiles: jest.fn(async () => ({ fileList: [] })),
  })),
  CryptoCfg: jest.fn(),
  ClientConfig: jest.fn(),
  HttpClient: jest.fn(),
  ComponentsHttpClient: jest.fn(),
  ComponentVersionRequest: jest.fn(),
  ComponentSearchRequest: jest.fn(),
  ScannerEvents: {
    DISPATCHER_NEW_DATA: 'dispatcher-new-data',
    RESULTS_APPENDED: 'results-appended',
    SCAN_DONE: 'scan-done',
    SCANNER_LOG: 'scanner-log',
  },
  logger: {
    setTransport: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
  },
  WinnowingMode: { WINNOWING_ONLY_MD5: 'winnowing_only_md5', FULL: 'full' },
}));
