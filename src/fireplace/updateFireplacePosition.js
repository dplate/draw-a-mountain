import findNearestTerrain from '../lib/findNearestTerrain.js';
import {MIN_Z} from '../lib/constants.js';

const SCALE_FIREPLACE = 0.02;
const SCALE_STONE = 0.005;
const SCALE_STUMP = 0.005;
const SCALE_SAUSAGE = 0.01;

const createEntranceTerrainInfo = (terrain, fireplacePoint) => {
  const testPoint = fireplacePoint.clone();
  testPoint.x -= 0.005;
  testPoint.y -= 0.01;
  return findNearestTerrain(terrain, testPoint);
};

const createFireplacePreparationPoint = (terrain, fireplacePoint) => {
  const testPoint = fireplacePoint.clone();
  testPoint.y -= 0.003;
  return findNearestTerrain(terrain, testPoint).point;
};

const placeStones = (terrain, fireplacePoint, {stones}) => {
  stones.forEach((stone, index) => {
    const angle = 2 * Math.PI * index / stones.length;
    stone.scale.x = SCALE_STONE * (Math.random() < 0.5 ? -1 : 1) * (0.8 + Math.random() * 0.4);
    stone.scale.y = SCALE_STONE * (0.8 + Math.random() * 0.4);
    stone.position.copy(fireplacePoint);
    stone.position.x += 0.0075 * Math.cos(angle);
    stone.position.z += 0.075 * Math.sin(angle);
    const terrainInfo = terrain.getTerrainInfoAtPoint(stone.position, true);
    if (terrainInfo) {
      stone.position.copy(terrainInfo.point);
    }
    stone.position.y += stone.scale.y * 0.5;
    stone.update();
  });
};

const placeSausage = (sausage, point, direction) => {
  sausage.scale.x = SCALE_SAUSAGE * (direction === 'right' ? 1 : -1);
  sausage.scale.y = SCALE_SAUSAGE;
  sausage.position.copy(point);
  sausage.position.x += sausage.scale.x * 0.7 - 1;
  sausage.position.y += SCALE_SAUSAGE;
};

const createSeat = (sausage, point, direction) => {
  return {
    position: point,
    direction: direction,
    taken: false,
    showSausage: () => {
      sausage.position.x += 1;
      sausage.update();
    },
    hideSausage: () => {
      sausage.position.x -= 1;
      sausage.update();
    }
  }
};

const placeStumps = (terrain, fireplacePoint, {stumps, sausages, navigationData}) => {
  navigationData.seats = [];
  stumps.forEach((stump, index) => {
    const sausage = sausages[index];
    const direction = (index < stumps.length / 2) ? 'right' : 'left'
    stump.scale.x = SCALE_STUMP;
    stump.scale.y = SCALE_STUMP;
    stump.position.copy(fireplacePoint);
    stump.position.x += (0.0125 + Math.random() * 0.005) * (direction === 'right' ? -1 : 1);
    stump.position.z += (0.06 + Math.random() * 0.02) * (index % 2 ? -1 : 1);
    const terrainInfo = terrain.getTerrainInfoAtPoint(stump.position, true);
    if (terrainInfo && Math.abs(terrainInfo.point.y - fireplacePoint.y) < 0.01) {
      stump.position.copy(terrainInfo.point);
      stump.position.y += SCALE_STUMP * 0.7;
      placeSausage(sausage, terrainInfo.point, direction);
      navigationData.seats.push(createSeat(sausage, terrainInfo.point, direction));
    } else {
      stump.position.x = -1;
      sausage.position.x = -1;
    }
    stump.update();
    sausage.update();
  });
  return navigationData.seats;
};

const placeFireplace = (terrain, resources, clickPoint) => {
  const checkPoint = clickPoint.clone();
  checkPoint.y -= 0.01;
  const terrainInfoClick = findNearestTerrain(terrain, checkPoint, 0.025, 0.025);
  terrainInfoClick.point.y -= 0.01;
  const fireplacePoint = terrain.getTerrainInfoAtPoint(terrainInfoClick.point).point;
  resources.navigationData.fireplacePoint = fireplacePoint;
  resources.navigationData.fireplacePreparationPoint = createFireplacePreparationPoint(terrain, fireplacePoint);
  resources.navigationData.entranceTerrainInfo = createEntranceTerrainInfo(terrain, fireplacePoint);

  [resources.fireplace, resources.woodBack, resources.fire, resources.woodFront].forEach((mesh, i) => {
    mesh.scale.x = SCALE_FIREPLACE;
    mesh.scale.y = SCALE_FIREPLACE;
    mesh.position.copy(fireplacePoint);
    mesh.position.z += i * 2 * MIN_Z;
  });
  return fireplacePoint;
}

const toggleVisibility = (resources, visible) => {
  resources.fireplace.visible = visible;
  resources.instancedStones.forEach(instancedStone => instancedStone.mesh.visible = visible);
  resources.instancedStump.mesh.visible = visible;
  resources.instancedSausage.mesh.visible = visible;
};

export default (terrain, resources, clickPoint) => {
  const fireplacePoint = placeFireplace(terrain, resources, clickPoint);
  placeStones(terrain, fireplacePoint, resources);
  const seats = placeStumps(terrain, fireplacePoint, resources);

  const placed = seats.length > 0;
  toggleVisibility(resources, placed);
  return placed;
};