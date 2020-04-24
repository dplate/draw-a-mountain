import loadSvg from "../lib/loadSvg.js";
import setOpacity from "../lib/setOpacity.js";
import optimizeBuildingY from "../lib/optimizeBuildingY.js";
import findNearestTerrain from "../lib/findNearestTerrain.js";

const SCALE_STATION = 0.06;

const updatePosition = (terrain, stationTopMesh, stationBottomMesh, clickPoint) => {
  const terrainInfoCenter = findNearestTerrain(terrain, clickPoint);
  if (terrainInfoCenter) {
    const {y, terrainTouch} = optimizeBuildingY(terrain, terrainInfoCenter.point, SCALE_STATION);

    setOpacity([stationTopMesh, stationBottomMesh], 0.25);

    const mirror = (terrainTouch === 'RIGHT' ? -1 : 1);

    stationTopMesh.visible = true;
    stationTopMesh.scale.x = mirror * SCALE_STATION;
    stationTopMesh.scale.y = SCALE_STATION;
    stationTopMesh.position.x = terrainInfoCenter.point.x;
    stationTopMesh.position.y = y + 0.9 * SCALE_STATION;
    stationTopMesh.position.z = terrainInfoCenter.point.z;

    const bottomPoint = new THREE.Vector3(stationBottomMesh.position.x, 0.01, clickPoint.z)
    bottomPoint.x = Math.min(bottomPoint.x, stationTopMesh.position.x + 0.1);
    bottomPoint.x = Math.max(bottomPoint.x, stationTopMesh.position.x - 0.1);
    const terrainInfoBottom = findNearestTerrain(terrain, bottomPoint);

    stationBottomMesh.visible = true;
    stationBottomMesh.scale.x = mirror * SCALE_STATION;
    stationBottomMesh.scale.y = SCALE_STATION;
    stationBottomMesh.position.x = terrainInfoBottom.point.x;
    stationBottomMesh.position.y = terrainInfoBottom.point.y + 0.9 * SCALE_STATION;
    stationBottomMesh.position.z = terrainInfoBottom.point.z;

    return true;
  }
  return false;
}
export default async (scene, menu, terrain, dispatcher) => {
  const stationTopMesh = await loadSvg('cableCar/station-top');
  stationTopMesh.visible = false;
  scene.add(stationTopMesh);

  const stationBottomMesh = await loadSvg('cableCar/station-bottom');
  stationBottomMesh.visible = false;
  stationBottomMesh.position.x = 0.5;
  scene.add(stationBottomMesh);

  let placed = false;

  dispatcher.listen('cableCar', 'touchStart', ({point}) => {
    if (!menu.isOnMenu(point)) {
      placed = updatePosition(terrain, stationTopMesh, stationBottomMesh, point);
    }
  });

  dispatcher.listen('cableCar', 'touchMove', ({point}) => {
    if (!menu.isOnMenu(point)) {
      placed = updatePosition(terrain, stationTopMesh, stationBottomMesh, point);
    }
  });

  dispatcher.listen('cableCar', 'touchEnd', async () => {
    if (placed) {
      setOpacity([stationTopMesh, stationBottomMesh], 1);
      await menu.waitForNext();

      dispatcher.stopListen('cableCar', 'touchStart');
      dispatcher.stopListen('cableCar', 'touchMove');
      dispatcher.stopListen('cableCar', 'touchEnd');
    }
  });
};