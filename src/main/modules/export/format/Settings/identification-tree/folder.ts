import DecisionNode from './decision-node';
import { Bom } from '../types';
import { BomProcessor } from '../processors/bom-processor';

/**
 * @brief Represents a folder node in the tree structure
 *
 * @details A Folder node can contain multiple child nodes (either Folders or Leaves)
 * and manages settings for its entire subtree.
 */
export class Folder extends DecisionNode {
  children: Array<DecisionNode>;

  path: string;

  bom: Bom;

  /**
   * @brief Constructs a new Folder node
   * @param path The full path of the folder
   */
  constructor(path: string) {
    super();
    this.children = [];
    this.path = path;
    this.bom = { include: [], remove: [], replace: [] };
  }

  /**
   * @brief Adds a child node to this folder
   * @param child The node to add as a child
   */
  public addChild(child: DecisionNode) {
    this.children.push(child);
  }

  /**
   * @brief Gets the full path of the folder
   * @return The folder's path
   */
  public getPath(): string {
    return this.path;
  }

  /**
   * @brief Generates settings file for this folder
   *
   * @details Recursively processes all child nodes and combines their settings.
   * The folder's settings are then processed by the provided processor.
   *
   * @param processor The settings processor to use
   * @return The combined settings for this folder and its subtree
   */
  public generateBom(processor: BomProcessor): Bom {
    this.bom = { include: [], remove: [], replace: [] };
    this.children.forEach((child) => {
      const partialBom = child.generateBom(processor);
      this.bom.remove = [...this.bom.remove, ...partialBom.remove];
      this.bom.include = [...this.bom.include, ...partialBom.include];
      this.bom.replace = [...this.bom.replace, ...partialBom.replace];
    });
    processor.processFolder(this);
    return this.bom;
  }

  /**
   * @brief Gets the current settings of the folder
   * @return The folder's settings
   */
  public getBom(): Bom {
    return this.bom;
  }
}
