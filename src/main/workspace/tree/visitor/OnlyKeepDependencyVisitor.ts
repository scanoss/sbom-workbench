import { Visitor } from './Visitor';
import Folder from '../Folder';
import File from '../File';

export type hasDependency = boolean;

export class OnlyKeepDependencyVisitor implements Visitor<hasDependency> {
  VisitFile(file: File): hasDependency {
    return file.isDependency();
  }

  VisitFolder(folder: Folder): hasDependency {
    const children = folder.getChildren();

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.accept<hasDependency>(this) === false) {
        folder.removeChild(child);
      }
    }

    // If the current folder is empty, it should be deleted from the parent. return false for that.
    if (folder.isEmpty()) return false;
    return true;
  }
}
