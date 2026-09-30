/**
 * @jest-environment node
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import { Indexer } from '../../main/modules/searchEngine/indexer/Indexer';
import { readIndexVersion, searcher } from '../../main/modules/searchEngine/searcher/Searcher';
import { BlackListKeyWordIndex } from '../../main/workspace/tree/blackList/BlackListKeyWordIndex';
import {
  containsAllTerms,
  getLegacySearchConfig,
  getQueryTerms,
  isExactIndexQuery,
  SEARCH_INDEX_VERSION,
} from '../../shared/utils/search-utils';

jest.mock('electron-log', () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() }));
jest.mock('../../main/broadcastManager/BroadcastManager', () => ({
  broadcastManager: { get: () => ({ send: jest.fn() }) },
}));

const { Index } = require('flexsearch');

const utf16 = (text: string) => Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(text, 'utf16le')]);

const FIXTURES: Record<string, string | Buffer> = {
  '/LICENSE': 'MIT License\n\nCopyright (c) 2020 Foo\n\nPermission is hereby granted',
  '/src/main.c': 'int main() { return 0; } // Copyright (c) Bar',
  '/src/header.ts': '// SPDX-FileCopyrightText: 2024 Acme\nexport const x = 1;',
  '/src/crypto.js': 'const cipher = createEncryption(key);',
  '/src/hash.go': 'sum := sha256.Sum256(data)',
  '/docs/utf16.txt': utf16('hello utf16 world'),
  '/img/logo.png': Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00, 0x00, 0x1a, 0x0a]),
  "/src/it's.txt": 'quoted path content',
  '/docs/intl.md': 'Diseño del año, straße und 日本語テキスト',
};

describe('keyword search index', () => {
  let root: string;
  let source: string;
  let dictionary: string;
  const ids: Record<string, number> = {};

  const search = (query: string, params: Record<string, number> = { limit: 1000 }) => (
    searcher.search({ query, params }).sort((a, b) => a - b)
  );

  beforeAll(async () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'search-index-'));
    source = path.join(root, 'source');
    dictionary = path.join(root, 'dictionary');
    const files = Object.entries(FIXTURES).map(([file, content], i) => {
      fs.mkdirSync(path.join(source, path.dirname(file)), { recursive: true });
      fs.writeFileSync(path.join(source, file), content);
      ids[file] = i + 1;
      return { fileId: i + 1, path: file };
    });
    for (let i = 0; i < 600; i += 1) {
      const file = `/bulk/file${i}.txt`;
      fs.mkdirSync(path.join(source, 'bulk'), { recursive: true });
      fs.writeFileSync(path.join(source, file), `bulk content number ${i}`);
      files.push({ fileId: 1000 + i, path: file });
    }
    const indexer = new Indexer();
    await indexer.saveIndex(await indexer.index(files, source), dictionary);
    searcher.closeIndex();
    searcher.loadIndex(dictionary);
  });

  afterAll(() => {
    searcher.closeIndex();
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('writes the index version', () => {
    expect(readIndexVersion(dictionary)).toBe(SEARCH_INDEX_VERSION);
    expect(searcher.getVersion()).toBe(SEARCH_INDEX_VERSION);
  });

  it('finds keywords in extension-less files and inline comments', () => {
    expect(search('copyright')).toEqual([ids['/LICENSE'], ids['/src/main.c'], ids['/src/header.ts']]);
  });

  it('finds 1 and 2 char keywords as whole words', () => {
    expect(search('c')).toEqual([ids['/LICENSE'], ids['/src/main.c']]);
    expect(search('x')).toEqual([ids['/src/header.ts']]);
  });

  it('finds keywords inside words', () => {
    expect(search('crypt')).toEqual([ids['/src/crypto.js']]);
    expect(search('sha')).toEqual([ids['/src/hash.go']]);
  });

  it('indexes UTF-16 files and skips binaries', () => {
    expect(search('utf16')).toEqual([ids['/docs/utf16.txt']]);
    expect(search('png')).toEqual([]);
  });

  it('indexes paths containing quotes', () => {
    expect(search('quoted')).toEqual([ids["/src/it's.txt"]]);
  });

  it('finds non-ASCII keywords', () => {
    expect(search(getQueryTerms('año').join(' '))).toEqual([ids['/docs/intl.md']]);
    expect(search(getQueryTerms('日本語').join(' '))).toEqual([ids['/docs/intl.md']]);
  });

  it('removes temp folders left by a crashed save', async () => {
    const other = path.join(root, 'other');
    fs.mkdirSync(other);
    const orphan = path.join(other, 'dictionary.1-1.tmp');
    fs.mkdirSync(orphan);
    const indexer = new Indexer();
    await indexer.saveIndex(await indexer.index([{ fileId: 1, path: '/LICENSE' }], source), path.join(other, 'dictionary'));
    expect(fs.readdirSync(other)).toEqual(['dictionary']);
  });

  it('requires every term of a multi-term query', () => {
    expect(search('copyright permission')).toEqual([ids['/LICENSE']]);
  });

  it('pages results with offset', () => {
    const first = search('bulk', { limit: 500, offset: 0 });
    const second = search('bulk', { limit: 500, offset: 500 });
    expect(first).toHaveLength(500);
    expect(second).toHaveLength(100);
    expect(first.filter((id) => second.includes(id))).toEqual([]);
  });

  it('loads a legacy dictionary without a version file', () => {
    const legacy = path.join(root, 'legacy');
    fs.mkdirSync(legacy);
    const index = new Index(getLegacySearchConfig());
    index.add(1, 'legacy copyright notice');
    index.export((key: string, data: string) => fs.writeFileSync(path.join(legacy, `${key}.json`), data ?? ''));
    searcher.closeIndex();
    searcher.loadIndex(legacy);
    expect(searcher.getVersion()).toBe(1);
    expect(searcher.search({ query: 'copyright' })).toEqual([1]);
    expect(searcher.search({ query: 'copyright', params: { offset: 500, limit: 500 } })).toEqual([]);
    searcher.closeIndex();
    searcher.loadIndex(dictionary);
  });
});

describe('query helpers', () => {
  it('splits queries on the same boundaries as the index', () => {
    expect(getQueryTerms('straße año')).toEqual(['straße', 'año']);
  });

  it('dedupes terms and keeps short ones', () => {
    expect(getQueryTerms('Copyright (c) copyright MIT')).toEqual(['copyright', 'c', 'mit']);
  });

  it('skips verification only for a single term of up to 3 chars', () => {
    expect(isExactIndexQuery(['sha'])).toBe(true);
    expect(isExactIndexQuery(['go'])).toBe(true);
    expect(isExactIndexQuery(['crypt'])).toBe(false);
    expect(isExactIndexQuery(['sha', 'rsa'])).toBe(false);
  });

  it('verifies substrings case-insensitively', () => {
    expect(containsAllTerms('SPDX-FileCopyrightText', ['copyright', 'text'])).toBe(true);
    expect(containsAllTerms('copy the right way', ['copyright'])).toBe(false);
  });
});

describe('keyword index blacklist', () => {
  const node = (nodePath: string, type = 'file') => ({
    getPath: () => nodePath,
    getLabel: () => path.basename(nodePath),
    getType: () => type,
  }) as any;

  it('skips vendor, dot and notebook files unless all file types are included', () => {
    const defaults = new BlackListKeyWordIndex();
    const all = new BlackListKeyWordIndex({ allExtensions: true });
    ['/vendor', '/.github', '/nb.ipynb'].forEach((p) => {
      const type = p.includes('.ipynb') ? 'file' : 'folder';
      expect(defaults.evaluate(node(p, type))).toBe(true);
      expect(all.evaluate(node(p, type))).toBe(false);
    });
  });

  it('skips every binary that the old extension list covered, in any case', () => {
    const all = new BlackListKeyWordIndex({ allExtensions: true });
    ['.jpg', '.png', '.gif', '.woff', '.woff2', '.rar', '.jar', '.PNG', '.Jar'].forEach((ext) => {
      expect(all.evaluate(node(`/assets/file${ext}`))).toBe(true);
    });
  });

  it('skips notebooks in any case unless all file types are included', () => {
    expect(new BlackListKeyWordIndex().evaluate(node('/nb/Analysis.IPYNB'))).toBe(true);
    expect(new BlackListKeyWordIndex({ allExtensions: true }).evaluate(node('/nb/Analysis.IPYNB'))).toBe(false);
  });

  it('keeps text files and folders named like binaries', () => {
    const defaults = new BlackListKeyWordIndex();
    expect(defaults.evaluate(node('/src/main.c'))).toBe(false);
    expect(defaults.evaluate(node('/license'))).toBe(false);
    expect(defaults.evaluate(node('/icons.png', 'folder'))).toBe(false);
  });

  it('always skips binaries and never skips the root', () => {
    const all = new BlackListKeyWordIndex({ allExtensions: true });
    expect(all.evaluate(node('/logo.png'))).toBe(true);
    expect(all.evaluate(node('/lib.so'))).toBe(true);
    expect(all.evaluate(node('', 'folder'))).toBe(false);
  });
});
