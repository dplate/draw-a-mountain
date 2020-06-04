import intersectLineSegments from "../../lib/intersectLineSegments.js";

const MAX_SNAP_DISTANCE = 0.02;

const calculateDistance = (node, lineSegments, point, currentProbeLine) => {
  const nearestPoint = new THREE.Vector3();
  const nodePoint = node.mesh.position;
  let nearestDistance = nodePoint.distanceTo(point);

  if (currentProbeLine && currentProbeLine.start !== nodePoint) {
    currentProbeLine.closestPointToPoint(nodePoint, true, nearestPoint);
    nearestDistance = Math.min(nearestDistance, nodePoint.distanceTo(nearestPoint));
  }

  lineSegments.forEach(lineSegment => {
    const pointOffset = lineSegment.closestPointToPointParameter(point, true);
    if (pointOffset < 0.5) {
      lineSegment.at(pointOffset, nearestPoint);
      nearestDistance = Math.min(nearestPoint.distanceTo(point), nearestDistance);
    }
  });
  return nearestDistance;
};

const intersectWithProbeLine = (nodeDistances, point, currentNode) => {
  if (!currentNode) {
    return false;
  }
  const nodePoint = currentNode.mesh.position;
  const currentProbeLine = new THREE.Line3(nodePoint, point);
  return nodeDistances.find(nodeDistance => {
    return nodeDistance.lineSegments.find(lineSegment =>
      point !== lineSegment.start && point !== lineSegment.end &&
      nodePoint !== lineSegment.start && nodePoint !== lineSegment.end &&
      intersectLineSegments(lineSegment, currentProbeLine)
    );
  });
};

export default (nodes, point, currentNode) => {
  const currentProbeLine = currentNode && new THREE.Line3(currentNode.mesh.position, point);
  const nodeDistances = nodes.map(node => {
    const lineSegments = node.paths.filter(path => path.nodes.length > 1).map(path => {
      const neighbourNode = path.nodes.find(node2 => node2 !== node);
      return new THREE.Line3(node.mesh.position, neighbourNode.mesh.position);
    });
    return {
      node,
      lineSegments,
      distance: calculateDistance(node, lineSegments, point, currentProbeLine),
      distanceToCurrent: currentNode ? currentNode.mesh.position.distanceTo(node.mesh.position) : 0
    };
  });
  const sortedNodeDistances = nodeDistances.sort((nodeDistance1, nodeDistance2) => {
    return (nodeDistance1.distance + nodeDistance1.distanceToCurrent) / 2 -
      (nodeDistance2.distance + nodeDistance2.distanceToCurrent) / 2;
  });

  let intersection = intersectWithProbeLine(nodeDistances, point, currentNode);
  const foundNodeDistance = sortedNodeDistances.find((nodeDistance) => {
    if (intersection || nodeDistance.distance <= MAX_SNAP_DISTANCE) {
      intersection = intersectWithProbeLine(nodeDistances, nodeDistance.node.mesh.position, currentNode);
      return !intersection;
    }
  });

  return foundNodeDistance && foundNodeDistance.node;
};