import { BlackListAbstract } from './BlackListAbstract';
import Node, { NodeStatus } from '../Node';

export class BlackListDependencies extends BlackListAbstract {
  private filter: NodeStatus = NodeStatus.FILTERED;

  public evaluate(node: Node): boolean {
    return node.getStatus() === this.filter;
  }
}
