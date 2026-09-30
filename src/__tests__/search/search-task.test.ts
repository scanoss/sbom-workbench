/**
 * @jest-environment node
 */
import fs from 'fs';
import os from 'os';
import path from 'path';

const project = { path: '', sourcePath: '' };

jest.mock('electron-log', () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() }));
jest.mock('../../main/broadcastManager/BroadcastManager', () => ({
  broadcastManager: { get: () => ({ send: jest.fn() }) },
}));
jest.mock('../../main/workspace/Workspace', () => ({
  workspace: {
    getOpenProject: () => ({ getMyPath: () => project.path, getSourceCodePath: () => project.sourcePath }),
  },
}));
jest.mock('../../main/services/ProjectService', () => ({
  projectService: { getSourceCodeBasePath: () => project.sourcePath },
}));
jest.mock('../../main/services/ModelProvider', () => ({
  modelProvider: { model: { file: { getAllBySearch: jest.fn() } } },
}));

/* eslint-disable import/first */
import { Indexer } from '../../main/modules/searchEngine/indexer/Indexer';
import { searcher } from '../../main/modules/searchEngine/searcher/Searcher';
import { SearchTask } from '../../main/task/search/searchTask/SearchTask';
import { modelProvider } from '../../main/services/ModelProvider';
import * as utils from '../../main/utils/utils';
/* eslint-enable import/first */

const FILES: Record<string, string> = {
  '/false-positive.txt': 'copyr yrig right', // every trigram of "copyright", but not the word
  '/hit.txt': 'Copyright (c) 2020',
  '/sha.txt': 'sha only',
  '/go.txt': 'written in go, not in google',
  '/google.txt': 'google only',
};

describe('SearchTask', () => {
  let root: string;
  const idToPath: Record<number, string> = {};
  const getAllBySearch = modelProvider.model.file.getAllBySearch as jest.Mock;

  const run = (query: string, params: Record<string, number> = { limit: 100 }) => new SearchTask().run({ query, params });
  const paths = (rows: Array<{ path: string }>) => rows.map((r) => r.path).sort();

  beforeAll(async () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'search-task-'));
    const source = path.join(root, 'source');
    fs.mkdirSync(source);
    const files = [];
    const add = (file: string, content: string, id: number) => {
      fs.writeFileSync(path.join(source, file), content);
      idToPath[id] = file;
      files.push({ fileId: id, path: file });
    };
    Object.entries(FILES).forEach(([file, content], i) => add(file, content, i + 1));
    // Odd files hold the word; even ones only its trigrams.
    for (let i = 0; i < 30; i += 1) add(`/bulk${i}.txt`, i % 2 ? 'bulkword' : 'bulkw kword', 100 + i);
    const indexer = new Indexer();
    await indexer.saveIndex(await indexer.index(files, source), path.join(root, 'dictionary'));
    project.path = root;
  });

  beforeEach(() => {
    project.sourcePath = path.join(root, 'source');
    searcher.closeIndex();
    // The real query joins one row per result, so every file comes back twice.
    getAllBySearch.mockReset().mockImplementation(async (qb: any) => qb.builders[0].value.flatMap((id: number) => [
      { id, path: idToPath[id], usage: 'file' },
      { id, path: idToPath[id], usage: 'snippet' },
    ]));
  });

  afterAll(() => {
    searcher.closeIndex();
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('drops trigram false positives', async () => {
    expect(paths(await run('copyright'))).toEqual(['/hit.txt']);
  });

  it('returns unverified candidates when the source is unavailable', async () => {
    project.sourcePath = '';
    expect(paths(await run('copyright'))).toEqual(['/false-positive.txt', '/hit.txt']);
  });

  it('returns a single trigram hit without reading files', async () => {
    const read = jest.spyOn(utils, 'readTextFile');
    expect(paths(await run('sha'))).toEqual(['/sha.txt']);
    expect(read).not.toHaveBeenCalled();
    await run('copyright');
    expect(read).toHaveBeenCalled();
    read.mockRestore();
  });

  it('matches short keywords as whole words, alone or with longer terms', async () => {
    expect(paths(await run('go'))).toEqual(['/go.txt']);
    expect(paths(await run('go google'))).toEqual(['/go.txt']);
  });

  it('pages verified hits without verifying them again', async () => {
    const pages = [];
    pages.push(await run('bulkword', { limit: 5, offset: 0 }));
    const calls = getAllBySearch.mock.calls.length;
    for (let offset = 5; offset < 20; offset += 5) pages.push(await run('bulkword', { limit: 5, offset }));
    const ids = pages.flat().map((r) => r.id);
    expect(getAllBySearch.mock.calls.length).toBe(calls);
    expect(ids.slice(0, 15)).toHaveLength(15);
    expect(new Set(ids).size).toBe(15);
    expect(ids.every((id) => id % 2 === 1)).toBe(true);
  });

  it('recomputes candidates on a new search or after the index is closed', async () => {
    const spy = jest.spyOn(searcher, 'search');
    await run('bulkword', { limit: 5, offset: 0 });
    await run('bulkword', { limit: 5, offset: 5 });
    expect(spy).toHaveBeenCalledTimes(1);
    await run('bulkword', { limit: 5, offset: 0 });
    expect(spy).toHaveBeenCalledTimes(2);
    searcher.closeIndex();
    const page = await run('bulkword', { limit: 5, offset: 5 });
    expect(spy).toHaveBeenCalledTimes(3);
    expect(page).toHaveLength(5);
    spy.mockRestore();
  });

  it('rejects when finished mid-run', async () => {
    const task = new SearchTask();
    const pending = task.run({ query: 'bulkword', params: { limit: 5 } });
    task.finish();
    await expect(pending).rejects.toThrow('SearchTask is finished');
  });
});
