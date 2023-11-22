import * as fs from 'fs';
import { NameFilter, AbstractFilter } from '../../filtering';
import { BlackListAbstract } from './BlackListAbstract';
import Node, { NodeStatus } from '../Node';

export class BlackListDependencies extends BlackListAbstract {
  private filters: Array<AbstractFilter> = [];

  public constructor(path: string) {
    super();
    this.load(path);
  }

  private load(path: string) {
    const file = fs.readFileSync(path, 'utf8');
    const f = JSON.parse(file);
    const { filters } = f;

    let i: number;
    for (i = 0; i < filters.length; i += 1) {
      if (filters[i].ftype === 'NAME' && filters[i].scope === 'FOLDER') this.filters.push(new NameFilter(filters[i].condition, filters[i].value, filters[i].scope));
    }
  }

  public evaluate(node: Node): boolean {
    return this.filters.some((filter) => !filter.evaluate(node.getPath()));
  }
}
