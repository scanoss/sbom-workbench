// eslint-disable-next-line import/no-cycle
import Node from '../Node';

export abstract class BlackListAbstract {
  public abstract evaluate(node: Node): boolean;
}
