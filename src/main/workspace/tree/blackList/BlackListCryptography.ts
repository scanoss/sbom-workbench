import { BlackListAbstract } from './BlackListAbstract';
import path from 'path';
import appConfigModule from '../../../../config/AppConfigModule';
import Node from '../Node';

/**
 * Blacklist filter for cryptography analysis.
 *
 * Filters out nodes that should be excluded from cryptography scanning:
 * - Hidden files and folders (those starting with '.')
 * - Binary files
 * - SCANOSS configuration files at the project root
 */
export class BlackListCryptography extends BlackListAbstract {
  /** Configuration files that should be excluded from cryptography analysis */
  private readonly CRYPTO_BLACKLIST_FILES = [
    appConfigModule.SCANOSS_CRYPTO_LIBRARY_RULES_FILE_NAME,
    appConfigModule.SCANOSS_CRYPTO_ALGORITHM_RULES_FILENAME,
    'scanoss.json',
    'scanoss-ignore.json',
    'scanoss-identify.json',
  ];

  /** Set of full paths to blacklisted files for O(1) lookup */
  private blacklist: Set<string>;

  /** Root path of the scan directory */
  private readonly scanRoot: string;

  /**
   * Creates a new BlackListCryptography instance.
   * @param scanRoot - The root directory path of the scan
   */
  constructor(scanRoot: string) {
    super();
    this.scanRoot = scanRoot;
    this.blacklist = new Set(this.CRYPTO_BLACKLIST_FILES.map((f) => path.join(scanRoot, f)));
  }

  /**
   * Evaluates whether a node should be excluded from cryptography analysis.
   *
   * @param node - The node (file or folder) to evaluate
   * @returns `true` if the node should be filtered out (excluded), `false` if it should be included
   *
   * Exclusion criteria:
   * - Root folder: never excluded (returns `false`)
   * - Hidden files/folders: excluded (path segment starts with '.')
   * - Binary files: excluded
   * - Blacklisted config files: excluded
   */
  evaluate(node: Node): boolean {
    const nodePath = node.getPath();

    // Root folder should never be filtered
    if (nodePath === '') return false;

    // Exclude hidden files and folders
    // Note: Tree module paths always use POSIX separators ('/'), regardless of platform
    const isHidden = nodePath.split('/').some((segment) => segment.startsWith('.'));
    if (isHidden) return true;

    // Exclude binary files or blacklisted configuration files
    return node.getIsBinaryFile() || this.blacklist.has(path.join(this.scanRoot, nodePath));
  }
}
