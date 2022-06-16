import { ComponentSource, FileTreeViewMode } from '../../../../api/types';
import { TreeViewMode } from './TreeViewMode';
import { TreeViewDefault } from './TreeViewDefault';
import { TreeViewFilterNotPrune } from './TreeViewFilterNotPrune';
import { TreeViewFilterPrune } from './TreeViewFilterPrune';

export class TreeViewModeCreator {
  public static create(filter: any, treeViewMode: FileTreeViewMode): TreeViewMode {
    if (
      !filter ||
      (filter.source === ComponentSource.ENGINE && Object.keys(filter).length === 1) ||
      (filter.path && Object.keys(filter).length === 1)
    )
      return new TreeViewDefault();
    if (treeViewMode === FileTreeViewMode.DEFAULT) return new TreeViewFilterNotPrune(filter);
    return new TreeViewFilterPrune(filter);
  }
}
