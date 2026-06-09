import { NameFilter, AbstractFilter } from '../../filtering';
import { BlackListAbstract } from './BlackListAbstract';
import Node from '../Node';

/** Shape of a single filter rule as persisted in the project's `filter.json`. */
export interface DependencyFilterRule {
  ftype: string;
  scope: string;
  condition: string;
  value: string;
}

export class BlackListDependencies extends BlackListAbstract {
  private filters: Array<AbstractFilter> = [];

  /**
   * Builds the dependency blacklist from filter rules (as persisted in the
   * project's `filter.json`). Only NAME/FOLDER rules are applied.
   *
   * Reading the rules from disk is intentionally left to the caller: this class
   * only owns the filtering logic, mirroring the other BlackList* filters which
   * keep their rules in memory. An empty list means nothing is excluded — e.g.
   * when a project is scanned with "Include all file types" enabled, no
   * `filter.json` is generated and the caller passes no rules.
   */
  public constructor(rules: Array<DependencyFilterRule> = []) {
    super();
    rules
      .filter((rule) => rule.ftype === 'NAME' && rule.scope === 'FOLDER')
      .forEach((rule) => this.filters.push(new NameFilter(rule.condition, rule.value, rule.scope)));
  }

  public evaluate(node: Node): boolean {
    return this.filters.some((filter) => !filter.evaluate(node.getPath()));
  }
}
