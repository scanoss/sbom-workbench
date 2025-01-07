import { BomProcessor } from '../processors/bom-processor';
import { Bom } from '../types';
/**
 * @brief Abstract base class representing a node in a tree structure
 *
 * @details This class defines the interface for both folder and leaf nodes
 * in a hierarchical tree structure.
 */
export default abstract class DecisionNode {
  /**
   * @brief Gets the path of the node
   * @return The full path of the node as a string
   */
  public abstract getPath(): string;

  /**
   * @brief Generates settings using the provided processor
   * @param processor The settings processor to use
   * @return SCANOSS Settings file
   */
  public abstract generateBom(processor: BomProcessor): Bom;

  /**
   * @brief Retrieves the current settings of the node
   * @return The current settings
   */
  public abstract getBom(): Bom;
}
