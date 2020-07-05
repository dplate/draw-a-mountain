import findNearestTerrain from '../lib/findNearestTerrain.js';
import {MIN_PERSON_Z} from '../lib/constants.js';

const createChair = (referencePoint, offsetX, direction) => {
  const point = referencePoint.clone();
  point.x += offsetX;
  point.y += 0.003;
  point.z += MIN_PERSON_Z;
  return {
    point,
    direction,
    taken: false
  };
};

const createTable = (referencePoint, offsetX) => {
  return [
    createChair(referencePoint, offsetX - 0.005, 'right'),
    createChair(referencePoint, offsetX + 0.005, 'left'),
    createChair(referencePoint, offsetX, 'front')
  ];
};

export default (terrain, terrainPoint, side) => {
  const doorPoint = new THREE.Vector3(
    terrainPoint.x + (side === 'CENTER' ? 0 : (side === 'LEFT' ? -0.01 : 0.01)),
    terrainPoint.y + 0.003,
    terrainPoint.z + MIN_PERSON_Z
  );
  const centerOffsetX = (side === 'CENTER' ? -0.003 : (side === 'LEFT' ? 0.0415 : -0.041))
  return {
    entranceTerrainInfo: findNearestTerrain(terrain, new THREE.Vector3(
      terrainPoint.x + (side === 'CENTER' ? 0 : (0.015 * (side === 'LEFT' ? -1 : 1))),
      terrainPoint.y - (side === 'CENTER' ? 0.005 : 0),
      terrainPoint.z
    )) || terrainInfo,
    doorPoint,
    tables: [
      createTable(terrainPoint, centerOffsetX - 0.0385),
      createTable(terrainPoint, centerOffsetX - 0.0125),
      createTable(terrainPoint, centerOffsetX + 0.014),
      createTable(terrainPoint, centerOffsetX + 0.0385)
    ]
  };
};