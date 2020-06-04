const checkPoint = new THREE.Vector3();

export default (terrain, clickPoint, marginX = 0, marginY = 0) => {
  const optimalY = Math.max(clickPoint.y, marginY);
  checkPoint.copy(clickPoint);
  checkPoint.x = Math.min(Math.max(marginX, checkPoint.x), 1 - marginX);
  checkPoint.y = Math.max(checkPoint.y, marginY);
  let searchStep = Math.max((checkPoint.y - marginY / 3), 0.004);
  let terrainInfo = null;
  while (searchStep > 0.001 && !(terrainInfo && Math.abs(optimalY - terrainInfo.point.y) < 0.001)) {
    terrainInfo = terrain.getTerrainInfoAtPoint(checkPoint);
    if (terrainInfo || checkPoint.y <= marginY) {
      checkPoint.y += searchStep;
      searchStep /= 3;
    }
    checkPoint.y -= searchStep;
    checkPoint.y = Math.max(checkPoint.y, marginY);
  }
  return terrainInfo;
};