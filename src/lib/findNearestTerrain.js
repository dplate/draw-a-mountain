const checkPoint = new THREE.Vector3();

export default (terrain, clickPoint) => {
  checkPoint.copy(clickPoint);
  checkPoint.x = Math.min(Math.max(0, checkPoint.x), 1);
  checkPoint.y = Math.max(checkPoint.y, 0);
  let searchStep = Math.max(clickPoint.y / 3, 0.002);
  let terrainInfo = null;
  while (searchStep > 0.001 && !(terrainInfo && Math.abs(clickPoint.y - terrainInfo.point.y) < 0.001)) {
    terrainInfo = terrain.getTerrainInfoAtPoint(checkPoint);
    if (terrainInfo || checkPoint.y <= 0) {
      checkPoint.y += searchStep;
      searchStep /= 3;
    }
    checkPoint.y -= searchStep;
    checkPoint.y = Math.max(checkPoint.y, 0);
  }
  return terrainInfo;
};