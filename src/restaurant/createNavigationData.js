import findNearestTerrain from '../lib/findNearestTerrain.js';
import {MIN_PERSON_Z} from '../lib/constants.js';

const createChair = (doorPoint, offsetX, direction) => {
  const point = doorPoint.clone();
  point.x += offsetX;
  return {
    point,
    direction,
    taken: false
  };
};

const createTable = (doorPoint, offsetX) => {
  return [
    createChair(doorPoint, offsetX - 0.005, 'right'),
    createChair(doorPoint, offsetX + 0.005, 'left'),
    createChair(doorPoint, offsetX, 'front')
  ];
};

export default (terrain, terrainInfo, side) => {
  const doorPoint = new THREE.Vector3(
    terrainInfo.point.x + (side === 'CENTER' ? 0 : (side === 'LEFT' ? -0.01 : 0.01)),
    terrainInfo.point.y + 0.003,
    terrainInfo.point.z + MIN_PERSON_Z
  );
  const centerOffsetX = (side === 'CENTER' ? -0.003 : (side === 'LEFT' ? 0.042 : -0.041))
  return {
    entranceTerrainInfo: findNearestTerrain(terrain, new THREE.Vector3(
      terrainInfo.point.x + (side === 'CENTER' ? 0 : (0.015 * (side === 'LEFT' ? -1 : 1))),
      terrainInfo.point.y - (side === 'CENTER' ? 0.005 : 0),
      terrainInfo.point.z
    )) || terrainInfo,
    doorPoint,
    tables: [
      createTable(doorPoint, centerOffsetX - 0.039),
      createTable(doorPoint, centerOffsetX - 0.013),
      createTable(doorPoint, centerOffsetX + 0.013),
      createTable(doorPoint, centerOffsetX + 0.039)
    ]
  };
};