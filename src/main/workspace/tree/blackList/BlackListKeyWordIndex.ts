import { BlackListAbstract } from './BlackListAbstract';
import Node, { NodeStatus } from '../Node';
import { workspace } from '../../Workspace';

import path from 'path';

export class BlackListKeyWordIndex extends BlackListAbstract {
  private scanRoot: string;

  private filesBlackList: Set<string>;

  private vendorFolders: Set<string>;

  private extensions: Set<string>;

  constructor() {
    super();
    this.filesBlackList = new Set([
      'gradlew.bat',
      'mvnw',
      'mvnw.cmd',
      'gradle-wrapper.jar',
      'maven-wrapper.jar',
      'thumbs.db',
      'copying.lib',
    ]);

    this.extensions = new Set<string>([
      '.jpg',
      '.png',
      '.gif',
      '.woff',
      '.woff2',
      '.rar',
      '.jar',
      '.ipynb',
    ]);

    this.vendorFolders = new Set(['node_modules', 'vendor']);

    this.scanRoot = workspace.getOpenProject()?.getScanRoot();
  }

  public evaluate(node: Node): boolean {
    return node.getLabel().startsWith('.') || this.vendorFolders.has(node.getLabel()) || this.extensions.has(path.extname(node.getPath()));
  }
}
