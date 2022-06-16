import { BlackListAbstract } from './BlackListAbstract';
import Node from '../Node';
import { workspace } from '../../Workspace';

export class BlackListKeyWordIndex extends BlackListAbstract {
  private scanRoot: string;

  private filesBlackList: Set<string>;

  private vendorFolders: Set<string>;

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
    this.vendorFolders = new Set(['node_modules', 'vendor']);
    this.scanRoot = workspace.getOpenProject().getScanRoot();
  }

  public evaluate(node: Node): boolean {
    return node.getLabel().startsWith('.') || this.vendorFolders.has(node.getLabel());
  }
}
