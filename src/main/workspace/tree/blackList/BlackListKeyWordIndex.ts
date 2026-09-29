import path from 'path';
import { BlackListAbstract } from './BlackListAbstract';
import Node from '../Node';

const isBinaryPath = require('is-binary-path');

interface BlackListKeyWordIndexOptions {
  // Mirrors the "Include all file types" scanner option.
  allExtensions?: boolean;
}

export class BlackListKeyWordIndex extends BlackListAbstract {
  private vendorFolders: Set<string>;

  private extensions: Set<string>;

  private skippedTextExtensions: Set<string>;

  private allExtensions: boolean;

  constructor(options: BlackListKeyWordIndexOptions = {}) {
    super();
    this.extensions = new Set<string>([
      '.jpg',
      '.png',
      '.gif',
      '.woff',
      '.woff2',
      '.rar',
      '.jar',
    ]);

    this.skippedTextExtensions = new Set<string>(['.ipynb']);

    this.vendorFolders = new Set(['node_modules', 'vendor']);

    this.allExtensions = options.allExtensions ?? false;
  }

  public evaluate(node: Node): boolean {
    // Root folder label is the project name, never filter it
    if (node.getPath() === '') return false;
    const isFile = node.getType() === 'file';
    if (isFile && (this.extensions.has(path.extname(node.getPath())) || isBinaryPath(node.getPath()))) return true;
    if (this.allExtensions) return false;
    if (isFile && this.skippedTextExtensions.has(path.extname(node.getPath()))) return true;
    return node.getLabel().startsWith('.') || this.vendorFolders.has(node.getLabel());
  }
}
