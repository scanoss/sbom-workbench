import { Visitor } from './Visitor';
import Folder from '../Folder';
import File from '../File';
import { BlackListAbstract } from '../blackList/BlackListAbstract';

export class CollectFilesVisitor implements Visitor<void> {
  public readonly files: File[] = [];

  private readonly banned: BlackListAbstract | null;

  constructor(banned: BlackListAbstract = null) {
    this.banned = banned;
  }

  VisitFolder(folder: Folder): void {
    if (this.banned && this.banned.evaluate(folder)) return;
    const children = folder.getChildren();
    for (let i = 0; i < children.length; i += 1) {
      children[i].accept<void>(this);
    }
  }

  VisitFile(file: File): void {
    if (this.banned && this.banned.evaluate(file)) return;
    this.files.push(file);
  }
}