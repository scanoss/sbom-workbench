import Folder from '../Folder';
import File from '../File';

export interface Visitor<T> {
  VisitFolder(folder: Folder): T;
  VisitFile(file: File): T;
}
