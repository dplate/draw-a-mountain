import addNode from './addNode.js';
import calculateOpticalDistance from '../../lib/calculateOpticalDistance.js';

const findNearestNodeInfo = (entrance, nearNodeInfo, nodeInfo) => {
  const distance = nodeInfo.entrances.reduce((maxDistance, otherEntrance) =>
      Math.max(calculateOpticalDistance(entrance.terrainInfo.point, otherEntrance.terrainInfo.point), maxDistance),
    0
  );
  if (!nearNodeInfo || distance < nearNodeInfo.distance) {
    return {distance, nodeInfo}
  }
  return nearNodeInfo;
};

const mergeEntranceIntoNodeInfo = (terrain, nodeInfo, entrance) => {
  const centerPoint = new THREE.Vector3();
  centerPoint.lerpVectors(nodeInfo.terrainInfo.point, entrance.terrainInfo.point, 0.5);
  nodeInfo.terrainInfo = terrain.getTerrainInfoAtPoint(centerPoint) || nodeInfo.terrainInfo;
  nodeInfo.entrances.push(entrance);
};

const reduceEntrances = (terrain, nodeInfos, entrance) => {
  const nearestNodeInfo = nodeInfos.reduce(findNearestNodeInfo.bind(null, entrance), null);
  if (nearestNodeInfo && nearestNodeInfo.distance < 0.02) {
    mergeEntranceIntoNodeInfo(terrain, nearestNodeInfo.nodeInfo, entrance);
    return nodeInfos;
  } else {
    return [
      ...nodeInfos,
      {terrainInfo: entrance.terrainInfo, entrances: [entrance]}
    ];
  }
};

export default (scene, terrain, pois) => {
  const entrances = pois.reduce((nodeInfos, poi) => [...nodeInfos, ...poi.entrances], []);
  const nodeInfos = entrances.reduce(reduceEntrances.bind(null, terrain), []);
  const nodes = [];
  nodeInfos.forEach(nodeInfo => addNode(scene, nodes, nodeInfo.terrainInfo, nodeInfo.entrances));
  return nodes;
};