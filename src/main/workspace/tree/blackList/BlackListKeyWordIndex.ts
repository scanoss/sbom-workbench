import path from 'path';
import { BlackListAbstract } from './BlackListAbstract';
import Node from '../Node';

const isBinaryPath = require('is-binary-path');

interface BlackListKeyWordIndexOptions {
  // Mirrors the "Include all file types" scanner option.
  allExtensions?: boolean;
}

export class BlackListKeyWordIndex extends BlackListAbstract {
  private defaultSkippedFolders: Set<string>;

  private defaultSkippedExtensions: Set<string>;

  private allExtensions: boolean;

  constructor(options: BlackListKeyWordIndexOptions = {}) {
    super();
    this.defaultSkippedFolders = new Set(['node_modules', 'vendor']);
    // Notebooks are text, but their saved cell outputs bloat the index.
    this.defaultSkippedExtensions = new Set(['.ipynb']);
    this.allExtensions = options.allExtensions ?? false;
  }

  public evaluate(node: Node): boolean {
    // Root folder label is the project name, never filter it.
    if (node.getPath() === '') return false;
    const isFile = node.getType() === 'file';
    // Binaries hold no searchable text, so they are skipped even with "Include all file types".
    if (isFile && isBinaryPath(node.getPath())) return true;
    if (this.allExtensions) return false;
    if (isFile && this.defaultSkippedExtensions.has(path.extname(node.getPath()).toLowerCase())) return true;
    return node.getLabel().startsWith('.') || this.defaultSkippedFolders.has(node.getLabel());
  }
}
