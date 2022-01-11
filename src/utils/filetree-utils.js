/**
 * Expand the tree from the given node
 * @param tree all the nodes of the tree
 * @param node node to expand
 * @returns tree with expanded nodes
 */
export const expandAll = (tree, node) => {
  const nNode = setExpanded(tree[0], node.value);
  return [nNode];
};

/**
 * Expand the tree to matches from the given node
 * @param tree all the nodes of the tree
 * @param node node to expand
 * @returns tree with expanded nodes
 */
export const expandToMatches = (tree, node) => {
  const nNode = expandNodesToMatch(tree[0], node.value, false);
  return [nNode];
};

/**
 * Collapse the tree from the given node
 * @param tree all the nodes of the tree
 * @param node node to collapse
 * @returns tree with collapsed nodes
 */
export const collapseAll = (tree, node) => {
  const nNode = setExpanded(tree[0], node.value, false);
  return [nNode];
};

/**
 * Adapt the tree to specific needs, maintining the same structure
 * @param tree new tree
 * @param previous previous tree
 * @returns new adapted tree
 */
export const convertTreeToNode = (tree, previous) => {
  const nTree = mapNode(tree, previous[0]);
  nTree.state = { expanded: true };
  return [tree];
};

const mapNode = (node, prev) => {
  node.id = node.value;
  node.name = node.label;
  node.state = prev.state;

  if (node.children) {
    node.children.forEach((child, index) => {
      mapNode(child, prev.children[index]);
    });
  }
  return node;
};

const setExpanded = (node, nodeValue, expanded = true, match = false) => {
  let isMatch = match;
  if (!isMatch && node.value === nodeValue) isMatch = true;
  const { children } = node;
  if (isMatch) node.state = { expanded };

  if (children) {
    children.forEach((child) => {
      setExpanded(child, nodeValue, expanded, isMatch);
    });
  }
  return node;
};

const expandNodesToMatch = (node, find, match) => {
  let nM = match;
  if (!nM && node.value === find) nM = true;
  const { children, value, type, hasPending, hasIgnored, hasIdentified } = node;
  if (nM && type === 'folder' && (hasPending || hasIgnored || hasIdentified)) node.state = { expanded: true };

  if (children) {
    children.forEach((child) => {
      expandNodesToMatch(child, find, nM);
    });
  }
  return node;
};
