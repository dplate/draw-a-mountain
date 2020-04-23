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

const setOpacity = (meshes, opacity) => {
  meshes.forEach((meshGroup) => {
    meshGroup.children.forEach((mesh) => {
      mesh.material.opacity = opacity;
      mesh.material.transparent = opacity < 1;
    })
  });
}

const findNearestTerrain = (terrain, clickPoint) => {
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
}

const updatePosition = (terrain, supportMesh, backMesh, frontMesh, clickPoint) => {
  const terrainInfoCenter = findNearestTerrain(terrain, clickPoint);
  if (terrainInfoCenter) {
    const {y, supportXOffset, frontXOffset} = getSlopeInfo(terrain, terrainInfoCenter.point);

    setOpacity([supportMesh, backMesh, frontMesh], 0.25);

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

    return true;
  }
  return false;
}

const emitSmokeParticle = (smoke, backMesh, elapsedTime) => {
  backMesh.userData.countdownForNextSmokeParticle -= elapsedTime;
  if (backMesh.userData.countdownForNextSmokeParticle < 0) {
    const position = backMesh.position.clone();
    position.x -= SCALE_BACK * 0.18;
    position.y -= SCALE_BACK * 0.09;
    const maxLifeTime = 10000 + Math.random() * 5000;
    const maxScale = 0.01 + Math.random() * 0.01;
    smoke.add(position, 0.005, maxScale, maxLifeTime);

    backMesh.userData.countdownForNextSmokeParticle += 1000 + Math.random() * 1000;
  }
}

export default async (scene, menu, smoke, terrain, dispatcher) => {
  const supportMesh = await loadSvg('restaurant/restaurant-support');
  supportMesh.visible = false;
  scene.add(supportMesh);
  const backMesh = await loadSvg('restaurant/restaurant-back');
  backMesh.visible = false;
  backMesh.userData = {countdownForNextSmokeParticle: 0};
  scene.add(backMesh);
  const frontMesh = await loadSvg('restaurant/restaurant-front');
  frontMesh.visible = false;
  scene.add(frontMesh);

  let placed = false;

  dispatcher.listen('restaurant', 'touchStart', ({point}) => {
    if (!menu.isOnMenu(point)) {
      placed = updatePosition(terrain, supportMesh, backMesh, frontMesh, point);
    }
  });

  dispatcher.listen('restaurant', 'touchMove', ({point}) => {
    if (!menu.isOnMenu(point)) {
      placed = updatePosition(terrain, supportMesh, backMesh, frontMesh, point);
    }
  });

  dispatcher.listen('restaurant', 'touchEnd', async () => {
    if (placed) {
      setOpacity([supportMesh, backMesh, frontMesh], 1);
      await menu.waitForNext();

      dispatcher.stopListen('restaurant', 'touchStart');
      dispatcher.stopListen('restaurant', 'touchMove');
      dispatcher.stopListen('restaurant', 'touchEnd');

      dispatcher.listen('restaurant', 'animate', ({elapsedTime}) => {
        emitSmokeParticle(smoke, backMesh, elapsedTime);
      });
    }
  });
};