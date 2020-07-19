import {MIN_Z} from '../lib/constants.js';

const SCALE_STONE = 0.005;
const SCALE_FIREPLACE = 0.02;

const placeStones = (terrain, fireplacePoint, {stones}) => {
  stones.forEach((stone, index) => {
    const angle = 2 * Math.PI * index / stones.length;
    stone.scale.x = SCALE_STONE * (Math.random() < 0.5 ? -1 : 1) * (0.8 + Math.random() * 0.4);
    stone.scale.y = SCALE_STONE * (0.8 + Math.random() * 0.4);
    stone.position.copy(fireplacePoint);
    stone.position.x += 0.0075 * Math.cos(angle);
    stone.position.z += 0.075 * Math.sin(angle);
    const terrainPoint = terrain.getTerrainPointAtPoint(stone.position, true);
    if (terrainPoint) {
      stone.position.copy(terrainPoint);
    }
    stone.position.y += stone.scale.y * 0.5;
    stone.update();
  });
};

export default (terrain, resources, clickPoint) => {
  const checkPoint = clickPoint.clone();
  checkPoint.y -= 0.01;
  const terrainInfoClick = terrain.findNearestTerrainInfo(checkPoint, 0.025, 0.025);
  terrainInfoClick.point.y -= 0.01;
  const fireplacePoint = terrain.getTerrainPointAtPoint(terrainInfoClick.point);
  resources.navigationData.fireplacePoint = fireplacePoint;

  [resources.fireplace, resources.woodBack, resources.fire, resources.woodFront].forEach((mesh, i) => {
    mesh.scale.x = SCALE_FIREPLACE;
    mesh.scale.y = SCALE_FIREPLACE;
    mesh.position.copy(fireplacePoint);
    mesh.position.z += i * 2 * MIN_Z;
  });

  resources.fireplace.visible = true;
  resources.instancedStones.forEach(instancedStone => instancedStone.mesh.visible = true);
  resources.instancedStump.mesh.visible = false;

  placeStones(terrain, fireplacePoint, resources);
};