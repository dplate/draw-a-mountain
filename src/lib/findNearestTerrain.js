export default (terrain, clickPoint) => {
  const checkPoint = clickPoint.clone();
  let searchStep = clickPoint.y / 3;
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