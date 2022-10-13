import path from 'path';
import { BlackListAbstract } from './BlackListAbstract';
import Node from '../Node';

// TODO: Change name on filters
export class ExtensionFilter extends BlackListAbstract {
  // The file extensions must include the dot. ie .zip
  private fileExtensions: Array<string>;

  constructor(fileExtensions: Array<string>) {
    super();
    this.fileExtensions = fileExtensions;
  }

  evaluate(node: Node): boolean {
    if (node.getType() === 'folder') return false;
    const nodeFileExtension = path.extname(node.getPath());
    if (
      this.fileExtensions.some(
        (supportedFormat) => supportedFormat === nodeFileExtension
      )
    )
      return false;
    return true;
  }
}
