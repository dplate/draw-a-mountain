import setOpacity from "../lib/setOpacity.js";
import optimizeBuildingY from "../lib/optimizeBuildingY.js";
import findNearestTerrain from "../lib/findNearestTerrain.js";
import updateTrack from "./updateTrack.js";
import loadMeshes from "./loadMeshes.js";

const SCALE_STATION = 0.06;

const updateStation = (mesh, position, mirror) => {
  mesh.visible = true;
  mesh.scale.x = mirror * SCALE_STATION;
  mesh.scale.y = SCALE_STATION;
  mesh.position.x = position.x;
  mesh.position.y = position.y + 0.9 * SCALE_STATION;
  mesh.position.z = position.z;
  mesh.userData.fixPoint = new THREE.Vector3(
    mesh.position.x + 0.15 * SCALE_STATION * mirror,
    mesh.position.y - 0.41 * SCALE_STATION,
    mesh.position.z
  );
  mesh.userData.mirror = mirror;
}

const updatePosition = (terrain, meshes, clickPoint) => {
  const terrainInfoCenter = findNearestTerrain(terrain, clickPoint);
  if (terrainInfoCenter) {
    const {y, terrainTouch} = optimizeBuildingY(terrain, terrainInfoCenter.point, SCALE_STATION);

    setOpacity(meshes, 0.25);

    const mirror = (terrainTouch === 'RIGHT' ? -1 : 1);

    const topPosition = new THREE.Vector3(terrainInfoCenter.point.x, y, terrainInfoCenter.point.z);
    updateStation(meshes.stationTop, topPosition, mirror);

    const bottomPoint = new THREE.Vector3(meshes.stationBottom.position.x, 0.01, clickPoint.z);
    const maxOffset = y * 0.7;
    bottomPoint.x = Math.min(bottomPoint.x, meshes.stationTop.position.x + maxOffset);
    bottomPoint.x = Math.max(bottomPoint.x, meshes.stationTop.position.x - maxOffset);
    const terrainInfoBottom = findNearestTerrain(terrain, bottomPoint);

    updateStation(meshes.stationBottom, terrainInfoBottom.point, mirror);

    updateTrack(terrain, meshes, false);

    return true;
  }
  return false;
}
export default async (scene, menu, terrain, dispatcher) => {
  const meshes = await loadMeshes(scene);
  let placed = false;

  dispatcher.listen('cableCar', 'touchStart', ({point}) => {
    if (!menu.isOnMenu(point)) {
      placed = updatePosition(terrain, meshes, point);
    }
  });

  dispatcher.listen('cableCar', 'touchMove', ({point}) => {
    if (!menu.isOnMenu(point)) {
      placed = updatePosition(terrain, meshes, point);
    }
  });

  dispatcher.listen('cableCar', 'touchEnd', async () => {
    if (placed) {
      setOpacity(meshes, 1);
      updateTrack(terrain, meshes, true);

      await menu.waitForNext();

      dispatcher.stopListen('cableCar', 'touchStart');
      dispatcher.stopListen('cableCar', 'touchMove');
      dispatcher.stopListen('cableCar', 'touchEnd');
    }
  });
};