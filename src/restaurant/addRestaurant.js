import loadSvg from "../lib/loadSvg.js";
import setOpacity from "../lib/setOpacity.js";
import optimizeBuildingY from "../lib/optimizeBuildingY.js";
import findNearestTerrain from "../lib/findNearestTerrain.js";

const SCALE_SUPPORT = 0.02;
const SCALE_BACK = 0.07;
const SCALE_FRONT = 0.10;

const getSlopeInfo = (terrain, centerPoint) => {
  const {terrainTouch, y} = optimizeBuildingY(terrain, centerPoint, SCALE_BACK * 0.7)

  if (terrainTouch === 'LEFT') {
    return {
      y,
      supportXOffset: SCALE_SUPPORT * 1.9,
      frontXOffset: SCALE_FRONT / 3 * 0.6
    }
  }
  if (terrainTouch === 'RIGHT') {
    return {
      y,
      supportXOffset: -SCALE_SUPPORT * 1.9,
      frontXOffset: -SCALE_FRONT / 3 * 0.4
    }
  }
  return {
    y,
    frontXOffset: 0
  }
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
      supportMesh.position.y = y + 0.05 * SCALE_BACK;
      supportMesh.position.z = terrainInfoCenter.point.z;
    } else {
      supportMesh.visible = false;
    }

    backMesh.visible = true;
    backMesh.scale.x = SCALE_BACK;
    backMesh.scale.y = SCALE_BACK;
    backMesh.position.x = terrainInfoCenter.point.x;
    backMesh.position.y = y + 0.7 * SCALE_BACK;
    backMesh.position.z = terrainInfoCenter.point.z;

    frontMesh.visible = true;
    frontMesh.scale.x = SCALE_FRONT;
    frontMesh.scale.y = SCALE_FRONT;
    frontMesh.position.x = terrainInfoCenter.point.x + frontXOffset;
    frontMesh.position.y = y + 0.25 * SCALE_FRONT;
    frontMesh.position.z = terrainInfoCenter.point.z;

    return true;
  }
  return false;
}

const emitSmokeParticle = (smoke, backMesh, elapsedTime) => {
  backMesh.userData.countdownForNextSmokeParticle -= elapsedTime;
  if (backMesh.userData.countdownForNextSmokeParticle < 0) {
    const position = backMesh.position.clone();
    position.x -= SCALE_BACK * 0.26;
    position.y -= SCALE_BACK * 0.13;
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