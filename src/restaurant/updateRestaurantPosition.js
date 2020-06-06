import optimizeBuildingY from '../lib/optimizeBuildingY.js';
import findNearestTerrain from '../lib/findNearestTerrain.js';
import setOpacityForAll from '../lib/setOpacityForAll.js';
import createNavigationData from './createNavigationData.js';

const SCALE_SUPPORT = 0.02;
const SCALE_BACK = 0.07;
const SCALE_FRONT = 0.10;

const getSlopeInfo = (terrain, terrainInfoCenter) => {
  const {terrainTouch, terrainInfo} = optimizeBuildingY(terrain, terrainInfoCenter, SCALE_BACK * 0.7)
  const navigationData = createNavigationData(terrain, terrainInfo, terrainTouch);
  if (terrainTouch === 'LEFT') {
    return {
      terrainInfo,
      supportXOffset: SCALE_SUPPORT * 1.9,
      frontXOffset: SCALE_FRONT / 3 * 0.6,
      navigationData
    }
  }
  if (terrainTouch === 'RIGHT') {
    return {
      terrainInfo,
      supportXOffset: -SCALE_SUPPORT * 1.9,
      frontXOffset: -SCALE_FRONT / 3 * 0.4,
      navigationData
    }
  }
  return {
    terrainInfo,
    frontXOffset: 0,
    navigationData
  }
}

export default (terrain, supportMesh, backMesh, frontMesh, clickPoint) => {
  const terrainInfoCenter = findNearestTerrain(terrain, clickPoint, SCALE_FRONT, 0.25 * SCALE_FRONT);
  if (terrainInfoCenter) {
    const {supportXOffset, frontXOffset, navigationData, terrainInfo} = getSlopeInfo(terrain, terrainInfoCenter);

    setOpacityForAll([supportMesh, backMesh, frontMesh], 0.25);

    if (supportXOffset) {
      supportMesh.visible = true;
      supportMesh.scale.x = (supportXOffset > 0 ? 1 : -1) * SCALE_SUPPORT;
      supportMesh.scale.y = SCALE_SUPPORT;
      supportMesh.position.x = terrainInfoCenter.point.x + supportXOffset;
      supportMesh.position.y = terrainInfo.point.y + 0.05 * SCALE_BACK;
      supportMesh.position.z = terrainInfoCenter.point.z;
    } else {
      supportMesh.visible = false;
    }

    backMesh.visible = true;
    backMesh.scale.x = SCALE_BACK;
    backMesh.scale.y = SCALE_BACK;
    backMesh.position.x = terrainInfoCenter.point.x;
    backMesh.position.y = terrainInfo.point.y + 0.7 * SCALE_BACK;
    backMesh.position.z = terrainInfoCenter.point.z;

    frontMesh.visible = true;
    frontMesh.scale.x = SCALE_FRONT;
    frontMesh.scale.y = SCALE_FRONT;
    frontMesh.position.x = terrainInfoCenter.point.x + frontXOffset;
    frontMesh.position.y = terrainInfo.point.y + 0.25 * SCALE_FRONT;
    frontMesh.position.z = terrainInfo.point.z + 0.002;

    frontMesh.userData.navigationData = navigationData;

    return true;
  }
  return false;
}