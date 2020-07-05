import optimizeBuildingY from '../lib/optimizeBuildingY.js';
import findNearestTerrain from '../lib/findNearestTerrain.js';
import setOpacityForAll from '../lib/setOpacityForAll.js';
import createNavigationData from './createNavigationData.js';
import {MIN_PERSON_Z} from '../lib/constants.js';

const SCALE_SUPPORT = 0.02;
const SCALE_BACK = 0.07;
const SCALE_FRONT = 0.10;

const getSlopeInfo = (terrain, terrainPointCenter) => {
  const {terrainTouch, terrainPoint} = optimizeBuildingY(terrain, terrainPointCenter, SCALE_BACK * 0.7)
  const navigationData = createNavigationData(terrain, terrainPoint, terrainTouch);
  if (terrainTouch === 'LEFT') {
    return {
      terrainPoint,
      supportXOffset: SCALE_SUPPORT * 1.9,
      frontXOffset: SCALE_FRONT / 3 * 0.6,
      navigationData
    }
  }
  if (terrainTouch === 'RIGHT') {
    return {
      terrainPoint,
      supportXOffset: -SCALE_SUPPORT * 1.9,
      frontXOffset: -SCALE_FRONT / 3 * 0.4,
      navigationData
    }
  }
  return {
    terrainPoint,
    frontXOffset: 0,
    navigationData
  }
}

export default (terrain, supportMesh, backMesh, frontMesh, clickPoint) => {
  const terrainInfoCenter = findNearestTerrain(terrain, clickPoint, SCALE_FRONT, 0.025);
  if (terrainInfoCenter) {
    const terrainPointCenter = terrainInfoCenter.point;
    const {supportXOffset, frontXOffset, navigationData, terrainPoint} = getSlopeInfo(terrain, terrainPointCenter);

    setOpacityForAll([supportMesh, backMesh, frontMesh], 0.25);

    if (supportXOffset) {
      supportMesh.visible = true;
      supportMesh.scale.x = (supportXOffset > 0 ? 1 : -1) * SCALE_SUPPORT;
      supportMesh.scale.y = SCALE_SUPPORT;
      supportMesh.position.x = terrainPointCenter.x + supportXOffset;
      supportMesh.position.y = terrainPoint.y + 0.05 * SCALE_BACK;
      supportMesh.position.z = terrainPointCenter.z;
    } else {
      supportMesh.visible = false;
    }

    backMesh.visible = true;
    backMesh.scale.x = SCALE_BACK;
    backMesh.scale.y = SCALE_BACK;
    backMesh.position.x = terrainPointCenter.x;
    backMesh.position.y = terrainPoint.y + 0.7 * SCALE_BACK;
    backMesh.position.z = terrainPointCenter.z;

    frontMesh.visible = true;
    frontMesh.scale.x = SCALE_FRONT;
    frontMesh.scale.y = SCALE_FRONT;
    frontMesh.position.x = terrainPointCenter.x + frontXOffset;
    frontMesh.position.y = terrainPoint.y + 0.25 * SCALE_FRONT;
    frontMesh.position.z = terrainPoint.z + 4 * MIN_PERSON_Z;

    frontMesh.userData.navigationData = navigationData;

    return true;
  }
  return false;
}