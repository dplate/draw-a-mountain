const entrancePoint = new THREE.Vector3();

const findEntranceTerrainInfo = (terrain, station) => {
  entrancePoint.copy(station.position);
  entrancePoint.x -= 0.6 * station.scale.x;
  entrancePoint.y -= 0.85 * station.scale.y;
  return terrain.findNearestTerrainInfo(entrancePoint);
}

export default (terrain, passengerHandler, meshes) => {
  const bottomEntrance = {
    terrainInfo: findEntranceTerrainInfo(terrain, meshes.stationBottom),
    type: 'cableCar'
  };
  const topEntrance = {
    terrainInfo: findEntranceTerrainInfo(terrain, meshes.stationTop),
    type: 'cableCar'
  };
  bottomEntrance.handlePersonGroup = passengerHandler.handlePersonGroup.bind(
    null, terrain, meshes.stationBottom, bottomEntrance, meshes.stationTop, topEntrance, meshes.car, -1
  );
  topEntrance.handlePersonGroup = passengerHandler.handlePersonGroup.bind(
    null, terrain, meshes.stationTop, topEntrance, meshes.stationBottom, bottomEntrance, meshes.car, 1
  );

  return [bottomEntrance, topEntrance];
}