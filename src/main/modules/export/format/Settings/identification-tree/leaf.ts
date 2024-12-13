import DecisionNode from './decision-node';
import { Bom } from '../types';
import { BomProcessor } from '../processors/bom-processor';

/**
 * @brief Represents a leaf node in the tree structure
 *
 * @details A Leaf node represents a file. It contains information about package URLs
 * and identification status.
 */
export class Leaf extends DecisionNode {
  private path: string;

  private matchedPurl: string;

  private identifiedPurl: string;

  private identified: number;

  private ignore: number;

  private bom: Bom;

  /**
   * @brief Constructs a new Leaf node
   * @param path Full path of the leaf
   * @param matchedPurl The matched package URL
   * @param identifiedPurl The identified package URL
   * @param identified Identification status
   * @param ignore Ignore status
   */
  constructor(path: string, matchedPurl: string, identifiedPurl: string, identified: number, ignore: number) {
    super();
    this.path = path;
    this.matchedPurl = matchedPurl;
    this.identifiedPurl = identifiedPurl;
    this.identified = identified;
    this.ignore = ignore;
    this.bom = { include: [], remove: [], replace: [] };
  }

  /**
   * @brief Gets the full path of the leaf
   * @return The leaf's path
   */
  public getPath(): string {
    return this.path;
  }

  /**
   * @brief Gets the identification status
   * @return The identification status value
   */
  public getIdentified(): number {
    return this.identified;
  }

  /**
   * @brief Gets the ignore status
   * @return The ignore status value
   */
  public getIgnore(): number {
    return this.ignore;
  }

  /**
   * @brief Gets the identified package URL
   * @return The identified package URL
   */
  public getIdentifiedPurl(): string {
    return this.identifiedPurl;
  }

  /**
   * @brief Gets the matched package URL
   * @return The matched package URL
   */
  public getMatchedPurl(): string {
    return this.matchedPurl;
  }

  /**
   * @brief Generates Bom for this leaf
   * @param processor The Bom processor to use
   * @return The generated Bom
   */
  public generateBom(processor: BomProcessor): Bom {
    processor.processLeaf(this);
    return this.bom;
  }

  /**
   * @brief Gets the current Bom of the leaf
   * @return The leaf's Bom
   */
  public getBom(): Bom {
    return this.bom;
  }

  /**
   * @brief Sets new Bom for this leaf
   * @param bom The Bom to apply
   */
  public setBom(bom: Bom) {
    this.bom = bom;
  }
}
