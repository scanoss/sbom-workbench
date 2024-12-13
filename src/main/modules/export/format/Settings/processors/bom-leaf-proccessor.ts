import { Leaf } from '../identification-tree/leaf';

/**
 * @brief Processor class for generating bom for leaf nodes
 *
 * @details This class handles the generation of settings for leaf nodes based on
 * their identification and ignore status. It implements rules for determining whether
 * a node should be removed, included, or have its PURL replaced.
 */
export class BomLeafProcessor {
  /**
     * @brief Generates bom for a leaf node based on its state
     *
     * @details This method implements the following rules:
     * 1. If the node is pending identification (identified=0, ignored=0), no settings are generated
     * 2. If the node is ignored (ignored > identified), it's marked for removal
     * 3. If the node's identified PURL matches its matched PURL, it's included
     * 4. If the PURLs differ, a replacement setting is generated
     *
     * The resulting settings object will contain arrays for:
     * - remove: Components to be removed from processing
     * - include: Components to be explicitly included
     * - replace: Components whose PURL should be replaced
     *
     * @param node The leaf node to process
     *
     */
  public generateBom(node: Leaf) {
    const identified = node.getIdentified();
    const ignored = node.getIgnore();
    const matchedPurl = node.getMatchedPurl();
    const identifiedPurl = node.getIdentifiedPurl();

    // Pending to be identified
    if (identified === 0 && ignored === 0) return;

    // Ignore (remove on settings file)
    if (ignored > identified) {
      node.setBom({ remove: [{ path: node.getPath(), purl: matchedPurl }], include: [], replace: [] });
      return;
    }

    // Identify (Include on settings file)
    if (identifiedPurl && matchedPurl && identifiedPurl === matchedPurl) {
      node.setBom({ include: [{ path: node.getPath(), purl: matchedPurl }], remove: [], replace: [] });
      return;
    }

    // Replace
    if (matchedPurl && identifiedPurl && identifiedPurl !== matchedPurl) {
      node.setBom({
        include: [],
        remove: [],
        replace: [{ paths: [node.getPath()], replace_with: identifiedPurl, purl: matchedPurl }] });
      return;
    }

    // Identify (Include on settings file)
    if (identified > ignored) {
      node.setBom({ include: [{ path: node.getPath(), purl: identifiedPurl }], remove: [], replace: [] });
    }
  }

  public process(node: Leaf) {
    this.generateBom(node);
  }
}
