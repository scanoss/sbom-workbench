import { Visitor } from './Visitor';
import Folder from '../Folder';
import File from '../File';
// Tiny helper visitor: "where does this node rank in the folder-first ordering?"
// Driven by double dispatch — no getType() calls.
const folderFirst: Visitor<number> = {
  VisitFolder: () => 0,
  VisitFile:   () => 1,
};

export class OrderTreeVisitor implements Visitor<void>{
  VisitFolder(folder: Folder): void {
    folder.getChildren().sort((a, b) => {
      const rankA = a.accept<number>(folderFirst);
      const rankB = b.accept<number>(folderFirst);
      if (rankA !== rankB) return rankA - rankB;
      return a.getPath().localeCompare(b.getPath());
    });
    for (const child of folder.getChildren()) child.accept<void>(this);
  }

  VisitFile(file: File): void {
    // no-op — files have no children to order
  }
}
