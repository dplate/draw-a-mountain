import setOpacity from '../lib/setOpacity.js';

const SCALE_CROSS = 0.025;

export default (terrain, crossMesh, clickPoint) => {
  const terrainInfoCross = terrain.findNearestTerrainInfo(clickPoint, 0.05, 0.025);
  if (terrainInfoCross) {
    const crossPoint = terrainInfoCross.point;
    setOpacity(crossMesh, 0.25);

    crossMesh.visible = true;
    crossMesh.scale.x = SCALE_CROSS;
    crossMesh.scale.y = SCALE_CROSS;
    crossMesh.position.x = crossPoint.x;
    crossMesh.position.y = crossPoint.y + 1.6 * SCALE_CROSS;
    crossMesh.position.z = crossPoint.z;
    crossMesh.userData.navigationData = {crossPoint}

    return true;
  }
  return false;
}