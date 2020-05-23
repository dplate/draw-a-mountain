import findNearestTerrain from "../lib/findNearestTerrain.js";

const entrancePoint = new THREE.Vector3();

const findEntranceTerrainInfo = (terrain, station) => {
  entrancePoint.copy(station.position);
  entrancePoint.x -= 0.6 * station.scale.x;
  entrancePoint.y -= 0.85 * station.scale.y;
  return findNearestTerrain(terrain, entrancePoint);
}

export default (terrain, passengerHandler, stationBottom, stationTop) => {
  const bottomEntrance = {
    terrainInfo: findEntranceTerrainInfo(terrain, stationBottom)
  };
  const topEntrance = {
    terrainInfo: findEntranceTerrainInfo(terrain, stationTop)
  };
  bottomEntrance.handlePersonGroup = passengerHandler.handlePersonGroup.bind(null, bottomEntrance, topEntrance);
  topEntrance.handlePersonGroup = passengerHandler.handlePersonGroup.bind(null, topEntrance, bottomEntrance);

  return [bottomEntrance, topEntrance];
}