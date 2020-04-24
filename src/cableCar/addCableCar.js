import loadSvg from "../lib/loadSvg.js";
import setOpacity from "../lib/setOpacity.js";
import optimizeBuildingY from "../lib/optimizeBuildingY.js";
import findNearestTerrain from "../lib/findNearestTerrain.js";

const SCALE_STATION = 0.05;
const SCALE_STAIRS = 0.025;
const SCALE_WHEEL = 0.03;

const updatePosition = (terrain, stationTopMesh, stationsStairsMesh, stationWheelMesh, clickPoint) => {
  const terrainInfoCenter = findNearestTerrain(terrain, clickPoint);
  if (terrainInfoCenter) {
    const {y, terrainTouch} = optimizeBuildingY(terrain, terrainInfoCenter.point, SCALE_STATION);

    setOpacity([stationTopMesh, stationsStairsMesh, stationWheelMesh], 0.25);

    stationsStairsMesh.visible = true;
    stationsStairsMesh.scale.x = (terrainTouch === 'RIGHT' ? -1 : 1) * SCALE_STAIRS;
    stationsStairsMesh.scale.y = SCALE_STAIRS;
    stationsStairsMesh.position.x = terrainInfoCenter.point.x - 0.5 * SCALE_STAIRS * (terrainTouch === 'RIGHT' ? -1 : 1);
    stationsStairsMesh.position.y = y + 0.4 * SCALE_STAIRS;
    stationsStairsMesh.position.z = terrainInfoCenter.point.z;

    stationWheelMesh.visible = true;
    stationWheelMesh.scale.x = SCALE_WHEEL;
    stationWheelMesh.scale.y = SCALE_WHEEL;
    stationWheelMesh.position.x = terrainInfoCenter.point.x;
    stationWheelMesh.position.y = y + 1.2 * SCALE_WHEEL;
    stationWheelMesh.position.z = terrainInfoCenter.point.z;

    stationTopMesh.visible = true;
    stationTopMesh.scale.x = SCALE_STATION;
    stationTopMesh.scale.y = SCALE_STATION;
    stationTopMesh.position.x = terrainInfoCenter.point.x;
    stationTopMesh.position.y = y + SCALE_STATION;
    stationTopMesh.position.z = terrainInfoCenter.point.z;

    return true;
  }
  return false;
}
export default async (scene, menu, terrain, dispatcher) => {
  const stationStairsMesh = await loadSvg('cableCar/station-stairs');
  stationStairsMesh.visible = false;
  scene.add(stationStairsMesh);

  const stationWheelMesh = await loadSvg('cableCar/station-wheel');
  stationWheelMesh.visible = false;
  scene.add(stationWheelMesh);

  const stationTopMesh = await loadSvg('cableCar/station-top');
  stationTopMesh.visible = false;
  scene.add(stationTopMesh);

  let placed = false;

  dispatcher.listen('cableCar', 'touchStart', ({point}) => {
    if (!menu.isOnMenu(point)) {
      placed = updatePosition(terrain, stationTopMesh, stationStairsMesh, stationWheelMesh, point);
    }
  });

  dispatcher.listen('cableCar', 'touchMove', ({point}) => {
    if (!menu.isOnMenu(point)) {
      placed = updatePosition(terrain, stationTopMesh, stationStairsMesh, stationWheelMesh, point);
    }
  });

  dispatcher.listen('cableCar', 'touchEnd', async () => {
    if (placed) {
      setOpacity([stationTopMesh, stationStairsMesh, stationWheelMesh], 1);
      await menu.waitForNext();

      dispatcher.stopListen('cableCar', 'touchStart');
      dispatcher.stopListen('cableCar', 'touchMove');
      dispatcher.stopListen('cableCar', 'touchEnd');
    }
  });
};