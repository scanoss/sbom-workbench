import path from 'path';
import DecisionNode from './decision-node';
import { BomProcessor } from '../processors/bom-processor';
import { Folder } from './folder';
import { Leaf } from './leaf';
import { DecisionData } from '../../../../../model/interfaces/report/DecisionData';
import { Bom } from '../types';

export class DecisionTree {
  private root: DecisionNode;

  private buildIdentificationTree(node: Folder, file: DecisionData, treeMap: Map<string, Folder>, pathList: Array<string>) {
    // If pathList length > 1 creates a folder node
    if (pathList.length > 1) {
      const newPath = pathList.shift() || '/';
      const fullPath = path.join(node.getPath(), newPath);

      if (!treeMap.has(fullPath)) {
        const newFolder = new Folder(fullPath);
        treeMap.set(fullPath, newFolder);
        treeMap.get(node.getPath())?.addChild(newFolder);
        this.buildIdentificationTree(newFolder, file, treeMap, pathList);
      } else {
        // Skips node creations
        const n = treeMap.get(fullPath);
        if (n) this.buildIdentificationTree(n, file, treeMap, pathList);
      }
      return;
    }
    // Creates leaf
    const l = new Leaf(file.path, file.original, file.identifiedAs, file.identified, file.ignored);
    treeMap.get(node.getPath())?.addChild(l);
  }

  public build(identificationData: Array<DecisionData>) {
    const treeMap = new Map<string, Folder>();
    const root = new Folder('');
    treeMap.set('', root);
    identificationData.forEach((d) => {
      this.buildIdentificationTree(root, d, treeMap, d.path.split('/'));
    });
    this.root = root;
  }

  public getBom(): Bom {
    return this.root.generateBom(new BomProcessor());
  }
}
