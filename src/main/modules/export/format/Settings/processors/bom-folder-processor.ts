import DecisionNode from '../identification-tree/decision-node';
import { Bom, BomItem, ReplaceBomItem } from '../types';
import { Folder } from '../identification-tree/folder';

export class BomFolderProcessor {
  public sanitizeRemove(node: DecisionNode) {
    node.getBom().remove = [{ path: node.getPath(), purl: node.getBom().remove[0].purl }];
  }

  public sanitizeInclude(node: DecisionNode) {
    node.getBom().include = [{ path: node.getPath(), purl: node.getBom().include[0].purl }];
  }

  public sanitizeReplace(node: DecisionNode) {
    const { purl: original, replace_with: replaced } = node.getBom().replace[0];
    const replace: boolean = node.getBom().replace.every((item: ReplaceBomItem) => item.purl === original
            && item.replace_with === replaced);
    if (replace) node.getBom().replace = [{ paths: [node.getPath()], purl: original, replace_with: replaced }];
  }

  public hasMultipleIdentifications(bom: Bom): boolean {
    return [
      bom.include.length > 0,
      bom.remove.length > 0,
      bom.replace.length > 0,
    ].filter(Boolean).length > 1;
  }

  public sanitizeBom(node: DecisionNode): void {
    if (this.hasMultipleIdentifications(node.getBom())) return;

    const included = new Set(node.getBom().include.map((i: BomItem) => i.purl));
    const ignored = new Set(node.getBom().remove.map((i: BomItem) => i.purl));

    if (ignored.size === 1) this.sanitizeRemove(node);
    if (included.size === 1) this.sanitizeInclude(node);

    if (node.getBom().replace.length > 0) this.sanitizeReplace(node);
  }

  public process(node: Folder) {
    this.sanitizeBom(node);
  }
}
