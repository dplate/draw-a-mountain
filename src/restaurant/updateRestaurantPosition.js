import optimizeBuildingY from "../lib/optimizeBuildingY.js";
import findNearestTerrain from "../lib/findNearestTerrain.js";
import setOpacity from "../lib/setOpacity.js";

const SCALE_SUPPORT = 0.02;
const SCALE_BACK = 0.07;
const SCALE_FRONT = 0.10;

const getSlopeInfo = (terrain, terrainInfoCenter) => {
  const {terrainTouch, terrainInfo} = optimizeBuildingY(terrain, terrainInfoCenter, SCALE_BACK * 0.7)

  if (terrainTouch === 'LEFT') {
    return {
      terrainInfo,
      supportXOffset: SCALE_SUPPORT * 1.9,
      frontXOffset: SCALE_FRONT / 3 * 0.6,
      navigationData: {
        entranceTerrainInfo: findNearestTerrain(terrain, new THREE.Vector3(
          terrainInfo.point.x - 0.015,
          terrainInfo.point.y,
          terrainInfo.point.z
        )) || terrainInfo,
        doorPoint: new THREE.Vector3(
          terrainInfo.point.x,
          terrainInfo.point.y,
          terrainInfo.point.z
        )
      }
    }
  }
  if (terrainTouch === 'RIGHT') {
    return {
      terrainInfo,
      supportXOffset: -SCALE_SUPPORT * 1.9,
      frontXOffset: -SCALE_FRONT / 3 * 0.4,
      navigationData: {
        entranceTerrainInfo: findNearestTerrain(terrain, new THREE.Vector3(
          terrainInfo.point.x + 0.015,
          terrainInfo.point.y,
          terrainInfo.point.z
        )) || terrainInfo,
        doorPoint: new THREE.Vector3(
          terrainInfo.point.x,
          terrainInfo.point.y,
          terrainInfo.point.z
        )
      }
    }
  }
  return {
    terrainInfo,
    frontXOffset: 0,
    navigationData: {
      entranceTerrainInfo: findNearestTerrain(terrain, new THREE.Vector3(
        terrainInfo.point.x,
        terrainInfo.point.y - 0.005,
        terrainInfo.point.z
      )) || terrainInfo,
      doorPoint: new THREE.Vector3(
        terrainInfo.point.x,
        terrainInfo.point.y,
        terrainInfo.point.z
      )
    }
  }
}

export default (terrain, supportMesh, backMesh, frontMesh, clickPoint) => {
  const terrainInfoCenter = findNearestTerrain(terrain, clickPoint);
  if (terrainInfoCenter) {
    const {supportXOffset, frontXOffset, navigationData, terrainInfo} = getSlopeInfo(terrain, terrainInfoCenter);

    setOpacity([supportMesh, backMesh, frontMesh], 0.25);

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
    frontMesh.position.z = terrainInfoCenter.point.z;

    frontMesh.userData.navigationData = navigationData;

    return true;
  }
  return false;
}