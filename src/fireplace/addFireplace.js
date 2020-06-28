import findNearestTerrain from '../lib/findNearestTerrain.js';
import playAudio from '../lib/playAudio.js';
import updateFireplacePosition from './updateFireplacePosition.js';
import createEatersHandler from './eaters/createEatersHandler.js';
import animateFire from './animateFire.js';
import loadFireplaceResources from './loadFireplaceResources.js';

const setTip = (tip, terrain) => {
  const path = new THREE.Path();
  const point = new THREE.Vector3(0.5, 10, 0);
  const terrainInfo = findNearestTerrain(terrain, point);
  path.moveTo(terrainInfo.point.x, terrainInfo.point.y * 0.3);
  path.lineTo(terrainInfo.point.x + 0.005, terrainInfo.point.y * 0.3);
  tip.setTip(path, 2000);
};

export default async ({scene, sound, dispatcher}, freightTrain, tip, terrain) => {
  return new Promise(async resolve => {
    const resources = await loadFireplaceResources(scene, sound);

    let placed = false;

    await freightTrain.deliver(['wood', 'rock']);
    setTip(tip, terrain);

    dispatcher.listen('fireplace', 'touchStart', ({point}) => {
      if (!freightTrain.isStarting()) {
        placed = updateFireplacePosition(terrain, resources, point);
      }
    });

    dispatcher.listen('fireplace', 'touchMove', ({point}) => {
      if (!freightTrain.isStarting()) {
        placed = updateFireplacePosition(terrain, resources, point);
      }
    });

    dispatcher.listen('fireplace', 'touchEnd', async () => {
      if (placed) {
        playAudio(resources.constructionAudio);

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
      } else {
        freightTrain.revokeSignal();
      }
    });
  });
};