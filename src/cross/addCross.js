import loadSvg from '../lib/loadSvg.js';
import setOpacityForAll from '../lib/setOpacityForAll.js';
import findNearestTerrain from '../lib/findNearestTerrain.js';
import getConstructionAudio from '../lib/getConstructionAudio.js';
import playAudio from '../lib/playAudio.js';
import updateCrossPosition from './updateCrossPosition.js';
import createSummiteerHandler from './summiteer/createSummiteerHandler.js';
import createInstancedObjectFromSvg from '../lib/createInstancedObjectFromSvg.js';

const setTip = (tip, terrain) => {
  const path = new THREE.Path();
  const searchWidth = 0.05;
  const point = new THREE.Vector3(0, 10, 0);
  let highestTerrainInfo = null;
  for (point.x = searchWidth; point.x <= 1 - searchWidth; point.x += 0.05) {
    const terrainInfo = findNearestTerrain(terrain, point);
    if (highestTerrainInfo === null || highestTerrainInfo.point.y < terrainInfo.point.y) {
      highestTerrainInfo = terrainInfo;
    }
  }
  path.moveTo(highestTerrainInfo.point.x, highestTerrainInfo.point.y);
  path.lineTo(highestTerrainInfo.point.x + 0.005, highestTerrainInfo.point.y);
  tip.setTip(path, 2000);
};

export default async ({scene, sound, dispatcher}, freightTrain, tip, terrain) => {
  return new Promise(async resolve => {
    const crossMesh = await loadSvg('cross/cross');
    crossMesh.visible = false;
    crossMesh.userData = {
      constructionAudio: await getConstructionAudio(sound)
    };
    crossMesh.add(crossMesh.userData.constructionAudio);
    scene.add(crossMesh);

    const instancedStone = await createInstancedObjectFromSvg(scene, 'cross/stone');
    const stones = [];
    for (let i = 0; i < 8; i++) {
      stones.push(instancedStone.addInstance());
    }
    instancedStone.mesh.visible = false;

    let placed = false;

    await freightTrain.deliver(['stone', 'wood']);
    setTip(tip, terrain);

    dispatcher.listen('cross', 'touchStart', ({point}) => {
      if (!freightTrain.isStarting()) {
        placed = updateCrossPosition(terrain, crossMesh, instancedStone, stones, point);
      }
    });

    dispatcher.listen('cross', 'touchMove', ({point}) => {
      if (!freightTrain.isStarting()) {
        placed = updateCrossPosition(terrain, crossMesh, instancedStone, stones, point);
      }
    });

    dispatcher.listen('cross', 'touchEnd', async () => {
      if (placed) {
        playAudio(crossMesh.userData.constructionAudio);
        setOpacityForAll([crossMesh, instancedStone.mesh], 1);

        if (!freightTrain.isWaitingForStart()) {
          await freightTrain.giveSignal();

          dispatcher.stopListen('cross', 'touchStart');
          dispatcher.stopListen('cross', 'touchMove');
          dispatcher.stopListen('cross', 'touchEnd');

          const summiteerHandler = createSummiteerHandler();

          dispatcher.listen('cross', 'animate', ({elapsedTime}) => {
            summiteerHandler.updateSummiteers(elapsedTime);
          });

          const entrance = {
            terrainInfo: crossMesh.userData.navigationData.entranceTerrainInfo,
            type: 'cross'
          };
          entrance.handlePersonGroup = summiteerHandler.handlePersonGroup.bind(
            null, terrain, entrance, crossMesh.userData.navigationData
          );

          resolve({entrances: [entrance]});
        }
      }
    });
  });
};