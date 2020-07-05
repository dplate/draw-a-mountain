import findNearestTerrain from '../lib/findNearestTerrain.js';
import {MIN_Z} from '../lib/constants.js';

const SCALE_FIREPLACE = 0.02;

export default (terrain, resources, clickPoint) => {
  const checkPoint = clickPoint.clone();
  checkPoint.y -= 0.01;
  const terrainInfoClick = findNearestTerrain(terrain, checkPoint, 0.025, 0.025);
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
  resources.instancedStones.forEach(instancedStone => instancedStone.mesh.visible = false);
  resources.instancedStump.mesh.visible = false;
};