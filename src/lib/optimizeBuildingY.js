export default (terrain, terrainInfoCenter, width, withoutCenter = false) => {
  const terrainInfoLeft = terrain.getTerrainInfoAtPoint(new THREE.Vector3(
    terrainInfoCenter.point.x - width / 2,
    0,
    terrainInfoCenter.point.z
  ), true);
  const leftPointY = terrainInfoLeft ? terrainInfoLeft.point.y : 0;

  const terrainInfoRight = terrain.getTerrainInfoAtPoint(new THREE.Vector3(
    terrainInfoCenter.point.x + width / 2,
    0,
    terrainInfoCenter.point.z
  ), true);
  const rightPointY = terrainInfoRight ? terrainInfoRight.point.y : 0;

  if (leftPointY > terrainInfoCenter.point.y && leftPointY > rightPointY) {
    return {
      terrainTouch: 'LEFT',
      terrainInfo: terrainInfoLeft
    }
  }
  if (rightPointY > terrainInfoCenter.point.y && rightPointY > leftPointY) {
    return {
      terrainTouch: 'RIGHT',
      terrainInfo: terrainInfoRight
    }
  }
  return {
    terrainTouch: withoutCenter ? (leftPointY > rightPointY ? 'LEFT' : 'RIGHT') : 'CENTER',
    terrainInfo: terrainInfoCenter
  }
};