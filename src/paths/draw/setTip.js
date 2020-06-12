import calculateOpticalDistance from '../../lib/calculateOpticalDistance.js';

const compareDistance = (info1, info2) => {
  return info1.distance - info2.distance;
};

export default (tip, nodes) => {
  const notConnectedNodesWithEntrance = nodes.filter(node => node.entrances.length > 0 && !node.connected);
  const connectedNodes = nodes.filter(node => node.connected);

  const distanceInfos = notConnectedNodesWithEntrance.map(notConnectedNode => {
    const distanceToConnectedInfos = connectedNodes.map(connectedNode => ({
      connectedNode,
      distance: calculateOpticalDistance(notConnectedNode.terrainInfo.point, connectedNode.terrainInfo.point)
    }));
    const nearestDistanceToConnectedInfo = distanceToConnectedInfos.sort(compareDistance)[0];
    return {
      notConnectedNode,
      ...nearestDistanceToConnectedInfo
    }
  });

  const {notConnectedNode, connectedNode} = distanceInfos.sort(compareDistance)[0];

  const path = new THREE.Path();
  path.moveTo(connectedNode.terrainInfo.point.x, connectedNode.terrainInfo.point.y);
  path.lineTo(notConnectedNode.terrainInfo.point.x, notConnectedNode.terrainInfo.point.y);
  tip.setTip(path, 3000);
};