import { Visitor } from './Visitor';
import Folder from '../Folder';
import File from '../File';
import { FileStatusType } from '@api/types';
import { NodeStatus } from '../Node';

export type keep = boolean;

export class FilterNodesByStatusVisitor implements Visitor<keep> {
  private statusToKeep: NodeStatus;

  constructor(statusToKeep: NodeStatus) {
    this.statusToKeep = statusToKeep;
  }

  VisitFile(file: File): keep {
    return file.getStatus() === this.statusToKeep
  }

  VisitFolder(folder: Folder): keep {
    const children = folder.getChildren();

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.accept<keep>(this) === false) {
        folder.removeChild(child);
      }
    }

    // If the current folder is empty, it should be deleted from the parent. return false for that.
    if (folder.isEmpty()) return false;
    return true;
  }
}
