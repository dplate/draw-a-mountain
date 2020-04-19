import loadSvg from "../lib/loadSvg.js";

const SCALE_SUPPORT = 0.02;
const SCALE_FRONT = 0.07;
const SCALE_BACK = 0.10;

const getSlopeInfo = (terrain, centerPoint) => {
  const terrainInfoLeft = terrain.getTerrainInfoAtPoint(new THREE.Vector3(
    centerPoint.x - SCALE_FRONT / 2 * 0.7,
    0,
    centerPoint.z
  ), true);
  const leftPointY = terrainInfoLeft ? terrainInfoLeft.point.y : 0;

  const terrainInfoRight = terrain.getTerrainInfoAtPoint(new THREE.Vector3(
    centerPoint.x + SCALE_FRONT / 2 * 0.7,
    0,
    centerPoint.z
  ), true);
  const rightPointY = terrainInfoRight ? terrainInfoRight.point.y : 0;

  if (leftPointY > centerPoint.y && leftPointY > rightPointY) {
    return {
      y: leftPointY,
      supportXOffset: SCALE_SUPPORT * 1.9,
      frontXOffset: SCALE_BACK / 3 * 0.6
    }
  }
  if (rightPointY > centerPoint.y && rightPointY > leftPointY) {
    return {
      y: rightPointY,
      supportXOffset: -SCALE_SUPPORT * 1.9,
      frontXOffset: -SCALE_BACK / 3 * 0.4
    }
  }
  return {
    y: centerPoint.y,
    frontXOffset: 0
  }
}

const updatePosition = (terrain, supportMesh, backMesh, frontMesh, clickPoint) => {
  const terrainInfoCenter = terrain.getTerrainInfoAtPoint(clickPoint);
  if (terrainInfoCenter) {
    const {y, supportXOffset, frontXOffset} = getSlopeInfo(terrain, terrainInfoCenter.point);

    if (supportXOffset) {
      supportMesh.visible = true;
      supportMesh.scale.x = (supportXOffset > 0 ? 1 : -1) * SCALE_SUPPORT;
      supportMesh.scale.y = SCALE_SUPPORT;
      supportMesh.position.x = terrainInfoCenter.point.x + supportXOffset;
      supportMesh.position.y = y + 0.05 * SCALE_FRONT;
      supportMesh.position.z = terrainInfoCenter.point.z;
    } else {
      supportMesh.visible = false;
    }

    backMesh.visible = true;
    backMesh.scale.x = SCALE_FRONT;
    backMesh.scale.y = SCALE_FRONT;
    backMesh.position.x = terrainInfoCenter.point.x;
    backMesh.position.y = y + 0.7 * SCALE_FRONT;
    backMesh.position.z = terrainInfoCenter.point.z;

    frontMesh.visible = true;
    frontMesh.scale.x = SCALE_BACK;
    frontMesh.scale.y = SCALE_BACK;
    frontMesh.position.x = terrainInfoCenter.point.x + frontXOffset;
    frontMesh.position.y = y + 0.25 * SCALE_BACK;
    frontMesh.position.z = terrainInfoCenter.point.z;
  }
}

export default async (scene, terrain, dispatcher) => {
  const supportMesh = await loadSvg('restaurant/restaurant-support');
  supportMesh.visible = false;
  scene.add(supportMesh);
  const backMesh = await loadSvg('restaurant/restaurant-back');
  backMesh.visible = false;
  scene.add(backMesh);
  const frontMesh = await loadSvg('restaurant/restaurant-front');
  frontMesh.visible = false;
  scene.add(frontMesh);

  dispatcher.listen('restaurant', 'touchStart', ({point}) => {
    updatePosition(terrain, supportMesh, backMesh, frontMesh, point);
  });

  dispatcher.listen('restaurant', 'touchMove', ({point}) => {
    updatePosition(terrain, supportMesh, backMesh, frontMesh, point);
  });
};