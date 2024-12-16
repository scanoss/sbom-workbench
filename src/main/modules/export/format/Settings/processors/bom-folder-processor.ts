import DecisionNode from '../identification-tree/decision-node';
import { Bom, BomItem, ReplaceBomItem } from '../types';
import { Folder } from '../identification-tree/folder';

/**
 * Processes and sanitizes Bill of Materials (BOM) data for folder structures.
 * Handles the consolidation and sanitization of include, remove, and replace directives in BOM entries.
 */
export class BomFolderProcessor {
  /**
   * Simplifies the remove directive for a node by consolidating to a single entry.
   * @param node - The decision node to sanitize
   */
  public sanitizeRemove(node: Folder) {
    node.getBom().remove = [{ path: node.getPath(), purl: node.getBom().remove[0].purl }];
  }

  /**
   * Simplifies the include directive for a node by consolidating to a single entry.
   * @param node - The decision node to sanitize
   */
  public sanitizeInclude(node: Folder) {
    node.getBom().include = [{ path: node.getPath(), purl: node.getBom().include[0].purl }];
  }

  /**
   * Consolidates replace directives for a node if they share the same original and replacement PURLs.
   * @param node - The decision node to sanitize
   */
  public sanitizeReplace(node: Folder) {
    const { purl: original, replace_with: replaced } = node.getBom().replace[0];
    const replace: boolean = node.getBom().replace.every((item: ReplaceBomItem) => item.purl === original
            && item.replace_with === replaced);
    if (replace) node.getBom().replace = [{ paths: [node.getPath()], purl: original, replace_with: replaced }];
  }

  /**
   * Checks if a BOM contains multiple types of directives (include, remove, replace).
   * @param bom - The BOM to check
   * @returns True if the BOM contains more than one type of directive
   */
  public hasMultipleIdentifications(bom: Bom): boolean {
    return [
      bom.include.length > 0,
      bom.remove.length > 0,
      bom.replace.length > 0,
    ].filter(Boolean).length > 1;
  }

  /**
   * Consolidates replace directives by merging paths for items with the same PURL and replacement.
   * @param node - The folder node whose replace directives should be merged
   */
  public mergeReplacedPaths(node: Folder) {
    const replaced = node.getBom().replace;

    const replacedMapper = new Map();
    replaced.forEach((item: ReplaceBomItem) => {
      const key = `${item.purl}@${item.replace_with}`;
      const existingItem = replacedMapper.get(key);

      if (existingItem) {
        existingItem.paths = [...existingItem.paths, ...item.paths];
      } else {
        replacedMapper.set(key, { ...item });
      }
    });

    if (replacedMapper.size <= 0) return;
    node.bom.replace = Array.from(replacedMapper.values());
  }

  /**
   * Sanitizes a node's BOM by consolidating directives when possible.
   * Only processes the BOM if it contains a single type of directive.
   * @param node - The decision node whose BOM should be sanitized
   */
  public sanitizeBom(node: Folder): void {
    if (this.hasMultipleIdentifications(node.getBom())) return;

    const included = new Set(node.getBom().include.map((i: BomItem) => i.purl));
    const ignored = new Set(node.getBom().remove.map((i: BomItem) => i.purl));

    if (ignored.size === 1) this.sanitizeRemove(node);
    if (included.size === 1) this.sanitizeInclude(node);

    if (node.getBom().replace.length > 0) this.sanitizeReplace(node);
  }

  public process(node: Folder) {
    this.sanitizeBom(node);
    this.mergeReplacedPaths(node);
  }
}
