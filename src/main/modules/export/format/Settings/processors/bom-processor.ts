import { Folder } from '../identification-tree/folder';
import { Leaf } from '../identification-tree/leaf';
import { BomFolderProcessor } from './bom-folder-processor';
import { Processor } from './processor';
import { BomLeafProcessor } from './bom-leaf-proccessor';

/**
 * @brief Interface defining the contract for node processors
 *
 * @details This interface establishes the required methods for processing
 * both folder and leaf nodes in the tree structure. Implementations of this
 * interface should provide specific processing logic for each node type.
 */
export interface IProcessor {
  processFolder(node: Folder): void;
  processLeaf(node: Leaf): void;
}

/**
 * @brief Concrete implementation of the Processor class for settings processing
 *
 * @details This class implements the processing logic for both folder and leaf nodes
 * by delegating to specialized processors for each node type. It uses
 * SettingsFolderProcessor for folders and SettingsLeafProcessor for leaves.
 */
export class BomProcessor extends Processor {
  private bomFolderProcessor: BomFolderProcessor;

  private bomLeafProcessor: BomLeafProcessor;

  /**
     * @brief Constructs a new SettingsProcessor
     *
     * @details Initializes the specialized processors for both folder and leaf nodes
     */
  constructor() {
    super();
    this.bomFolderProcessor = new BomFolderProcessor();
    this.bomLeafProcessor = new BomLeafProcessor();
  }

  public processFolder(node: Folder) {
    this.bomFolderProcessor.process(node);
  }

  public processLeaf(node: Leaf) {
    this.bomLeafProcessor.process(node);
  }
}
