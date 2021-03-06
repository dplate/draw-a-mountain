import setOpacityForAll from '../lib/setOpacityForAll.js';
import optimizeBuildingY from '../lib/optimizeBuildingY.js';
import updateTrack from './updateTrack.js';
import loadMeshes from './loadMeshes.js';
import updateCar from './updateCar.js';
import cleanTrack from './cleanTrack.js';
import createPassengerHandler from './passengers/createPassengerHandler.js';
import createEntrances from './createEntrances.js';

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
  mesh.userData.chimneyPoint = new THREE.Vector3(
    mesh.position.x - 0.21 * SCALE_STATION * mirror,
    mesh.position.y - 0.13 * SCALE_STATION,
    mesh.position.z
  );
  mesh.userData.mirror = mirror;
}

const updateStationsPosition = (terrain, meshes, clickPoint) => {
  const terrainInfoCenter = terrain.findNearestTerrainInfo(clickPoint, SCALE_STATION, 0.05);
  if (terrainInfoCenter) {
    const terrainPointCenter = terrainInfoCenter.point;
    const {terrainPoint, terrainTouch} = optimizeBuildingY(terrain, terrainPointCenter, SCALE_STATION, true);

    setOpacityForAll(meshes, 0.25);

    const mirror = (terrainTouch === 'RIGHT' ? -1 : 1);

    const topPosition = new THREE.Vector3(terrainPointCenter.x, terrainPoint.y, terrainPointCenter.z);
    updateStation(meshes.stationTop, topPosition, mirror);

    const bottomPoint = new THREE.Vector3(meshes.stationBottom.position.x, 0.01, clickPoint.z);
    const maxOffset = terrainPoint.y * 0.7;
    bottomPoint.x = Math.min(bottomPoint.x, meshes.stationTop.position.x + maxOffset);
    bottomPoint.x = Math.max(bottomPoint.x, meshes.stationTop.position.x - maxOffset);
    const terrainInfoBottom = terrain.findNearestTerrainInfo(bottomPoint, SCALE_STATION, 0.015);

    updateStation(meshes.stationBottom, terrainInfoBottom.point, mirror);

    updateTrack(terrain, meshes, false);

    return true;
  }
  return false;
};

const setTip = (tip, terrain) => {
  const path = new THREE.Path();
  const point = new THREE.Vector3(0.6, 10, 0);
  const terrainInfo = terrain.findNearestTerrainInfo(point);
  path.moveTo(terrainInfo.point.x, terrainInfo.point.y * 0.9);
  path.lineTo(terrainInfo.point.x + 0.005, terrainInfo.point.y * 0.9);
  tip.setTip(path, 2000);
};

export default async ({scene, audio, dispatcher}, freightTrain, tip, smoke, terrain, trees) => {
  return new Promise(async resolve => {
    const meshes = await loadMeshes(scene, audio);
    let placed = false;

    await freightTrain.deliver(['wood', 'cable', 'stone']);
    setTip(tip, terrain);

    dispatcher.listen('cableCar', 'touchStart', ({point}) => {
      if (!freightTrain.isStarting()) {
        placed = updateStationsPosition(terrain, meshes, point);
      }
    });

    dispatcher.listen('cableCar', 'touchMove', ({point}) => {
      if (!freightTrain.isStarting()) {
        placed = updateStationsPosition(terrain, meshes, point);
      }
    });

    dispatcher.listen('cableCar', 'touchEnd', async () => {
      if (placed && !freightTrain.isStarting()) {
        meshes.stationTop.userData.constructionSound.playAtPosition(meshes.stationTop.position, true);
        setOpacityForAll(meshes, 1);
        updateTrack(terrain, meshes, true);

        if (!freightTrain.isWaitingForStart()) {
          await freightTrain.giveSignal();

          dispatcher.stopListen('cableCar', 'touchStart');
          dispatcher.stopListen('cableCar', 'touchMove');
          dispatcher.stopListen('cableCar', 'touchEnd');

          cleanTrack(terrain, trees, meshes.primaryCable);
          const passengerHandler = createPassengerHandler();

          dispatcher.listen('cableCar', 'animate', ({elapsedTime}) => {
            updateCar(smoke, meshes, elapsedTime);
            passengerHandler.updatePassengers(elapsedTime);
          });

          resolve({
            entrances: createEntrances(terrain, passengerHandler, meshes)
          });
        }
      }
    });
  });
};