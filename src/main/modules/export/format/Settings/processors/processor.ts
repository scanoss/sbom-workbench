import { IProcessor } from './bom-processor';
import { Folder } from '../identification-tree/folder';
import { Leaf } from '../identification-tree/leaf';

/**
 * @brief Abstract base class implementing the IProcessor interface
 *
 * @details This abstract class serves as a base for concrete processor
 * implementations. It implements the IProcessor interface but leaves
 * the actual processing logic to be defined by derived classes.
 */
export abstract class Processor implements IProcessor {
  abstract processFolder(node: Folder): void;
  abstract processLeaf(node: Leaf): void;
}
