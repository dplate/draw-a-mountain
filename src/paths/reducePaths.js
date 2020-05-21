const hasNotSameNeighbourNode = (node) => {
  return node.paths[0].nodes.find(node1 => !node.paths[1].nodes.includes(node1));
}

const hasSameDifficulty = (node) => {
  return node.paths[0].difficulty === node.paths[1].difficulty;
}

const isPathShortEnough = (node) => {
  return (node.paths[0].steps.length + node.paths[1].steps.length) < 30;
}

const shouldRemoveNode = (node) => {
  return !node.entrance && node.paths.length === 2 &&
    hasSameDifficulty(node) &&
    hasNotSameNeighbourNode(node) &&
    isPathShortEnough(node);
}

const removeNode = (node) => {
  const newPath = node.paths[0];
  const obsoletePath = node.paths[1];
  const currentNodeIndex = newPath.nodes.findIndex(node1 => node1 === node);
  const nextNodeIndex = obsoletePath.nodes.findIndex(node1 => node1 !== node);
  const nextNode = obsoletePath.nodes[nextNodeIndex];
  newPath.nodes[currentNodeIndex] = nextNode;
  const nextSteps = obsoletePath.steps;
  if (currentNodeIndex !== nextNodeIndex) {
    nextSteps.reverse();
  }
  if (currentNodeIndex === 1) {
    nextSteps.shift();
    newPath.steps.push(...nextSteps);
  } else {
    newPath.steps.shift();
    newPath.steps = [...nextSteps, ...newPath.steps];
  }
  nextNode.paths = [...nextNode.paths.filter(path => path !== obsoletePath), newPath];
}

export default (nodes) => {
  return nodes.reduce((reducedNodes, node) => {
    if (shouldRemoveNode(node)) {
      removeNode(node);
      return reducedNodes;
    } else {
      return [...reducedNodes, node];
    }
  }, []);
}