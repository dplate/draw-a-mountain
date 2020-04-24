export default (terrain, centerPoint, width) => {
  const terrainInfoLeft = terrain.getTerrainInfoAtPoint(new THREE.Vector3(
    centerPoint.x - width / 2,
    0,
    centerPoint.z
  ), true);
  const leftPointY = terrainInfoLeft ? terrainInfoLeft.point.y : 0;

  const terrainInfoRight = terrain.getTerrainInfoAtPoint(new THREE.Vector3(
    centerPoint.x + width / 2,
    0,
    centerPoint.z
  ), true);
  const rightPointY = terrainInfoRight ? terrainInfoRight.point.y : 0;

  if (leftPointY > centerPoint.y && leftPointY > rightPointY) {
    return {
      terrainTouch: 'LEFT',
      y: leftPointY
    }
  }
  if (rightPointY > centerPoint.y && rightPointY > leftPointY) {
    return {
      terrainTouch: 'RIGHT',
      y: rightPointY
    }
  }
  return {
    terrainTouch: 'CENTER',
    y: centerPoint.y
  }
};