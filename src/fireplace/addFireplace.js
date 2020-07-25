import updateFireplacePosition from './updateFireplacePosition.js';
import createEatersHandler from './eaters/createEatersHandler.js';
import animateFire from './animateFire.js';
import loadFireplaceResources from './loadFireplaceResources.js';
import updateSeatPositions from './updateSeatPositions.js';

const setTip = (tip, terrain) => {
  const path = new THREE.Path();
  const point = new THREE.Vector3(0.5, 10, 0);
  const terrainInfo = terrain.findNearestTerrainInfo(point);
  path.moveTo(terrainInfo.point.x, terrainInfo.point.y * 0.3);
  path.lineTo(terrainInfo.point.x + 0.005, terrainInfo.point.y * 0.3);
  tip.setTip(path, 2000);
};

export default async ({scene, audio, dispatcher}, freightTrain, tip, terrain) => {
  return new Promise(async resolve => {
    const resources = await loadFireplaceResources(scene, audio);

    let placed = false;

    await freightTrain.deliver(['wood', 'rock']);
    setTip(tip, terrain);

    dispatcher.listen('fireplace', 'touchStart', ({point}) => {
      if (!freightTrain.isStarting()) {
        updateFireplacePosition(terrain, resources, point)
        placed = true;
      }
    });

    dispatcher.listen('fireplace', 'touchMove', ({point}) => {
      if (!freightTrain.isStarting()) {
        updateFireplacePosition(terrain, resources, point);
        placed = true;
      }
    });

    dispatcher.listen('fireplace', 'touchEnd', async () => {
      if (placed && !freightTrain.isStarting()) {
        resources.constructionSound.playAtPosition(resources.fireplace.position, true);
        updateSeatPositions(terrain, resources);

        if (!freightTrain.isWaitingForStart()) {
          await freightTrain.giveSignal();

          dispatcher.stopListen('fireplace', 'touchStart');
          dispatcher.stopListen('fireplace', 'touchMove');
          dispatcher.stopListen('fireplace', 'touchEnd');

          const entrance = {
            terrainInfo: resources.navigationData.entranceTerrainInfo,
            type: 'fireplace'
          };
          const eatersHandler = createEatersHandler(terrain, entrance, resources.navigationData, resources.fire.userData);
          entrance.handlePersonGroup = eatersHandler.handlePersonGroup;

          dispatcher.listen('fireplace', 'animate', ({elapsedTime}) => {
            eatersHandler.updateEaters(elapsedTime);
            animateFire(resources, elapsedTime);
          });

          resolve({entrances: [entrance]});
        }
      }
    });
  });
};