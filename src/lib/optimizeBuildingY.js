export default (terrain, terrainPointCenter, width, withoutCenter = false) => {
  const terrainPointLeft = terrain.getTerrainPointAtPoint(new THREE.Vector3(
    terrainPointCenter.x - width / 2,
    0,
    terrainPointCenter.z
  ), true);
  const leftPointY = terrainPointLeft ? terrainPointLeft.y : 0;

  const terrainPointRight = terrain.getTerrainPointAtPoint(new THREE.Vector3(
    terrainPointCenter.x + width / 2,
    0,
    terrainPointCenter.z
  ), true);
  const rightPointY = terrainPointRight ? terrainPointRight.y : 0;

  if (leftPointY > terrainPointCenter.y && leftPointY > rightPointY) {
    return {
      terrainTouch: 'LEFT',
      terrainPoint: terrainPointLeft
    }
  }
  if (rightPointY > terrainPointCenter.y && rightPointY > leftPointY) {
    return {
      terrainTouch: 'RIGHT',
      terrainPoint: terrainPointRight
    }
  }
  return {
    terrainTouch: withoutCenter ? (leftPointY > rightPointY ? 'LEFT' : 'RIGHT') : 'CENTER',
    terrainPoint: terrainPointCenter
  }
};