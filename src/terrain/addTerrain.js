import drawRidge from './drawRidge.js';
import createTerrainMesh, {MAX_QUAD_X} from './createTerrainMesh.js';
import createRocks from './createRocks.js';
import {findNearestTerrainInfo, getTerrainInfoAtPoint, getTerrainPointAtPoint} from './terrainHelpers.js';
import removeMesh from '../lib/removeMesh.js';
import addCapricorns from './addCapricorns.js';
import addGroundhog from './addGroundhog.js';
import addDaws from './addDaws.js';

const setTip = (tip) => {
  const path = new THREE.Path();
  path.moveTo(0, 0.1);
  path.splineThru([
    new THREE.Vector2(0.25, 0.25),
    new THREE.Vector2(0.5, 0.15),
    new THREE.Vector2(0.75, 0.3),
    new THREE.Vector2(1, 0.1)
  ]);

  tip.setTip(path, 5000);
}

export default ({scene, audio, dispatcher}, freightTrain, tip) => {
  return new Promise(async (resolve) => {
    const ridgeHeights = Array(MAX_QUAD_X + 1).fill(null);
    let maxHeight = null;
    let ridgeMesh = null;
    let terrainMesh = null;
    let terrainGrowthProgress = 0.001;
    let rockGrowthProgress = 0;
    let rockData = null;

    const rumbleSound = await audio.load('terrain/rumble');
    const windSound = await audio.load('terrain/wind', true);

    await freightTrain.deliver(['grass', 'snow', 'rock']);
    setTip(tip);

    dispatcher.listen('terrain', 'touchMove', ({point}) => {
      if (!terrainMesh && !freightTrain.isStarting()) {
        ridgeMesh = drawRidge(scene, ridgeHeights, point);
      }
    });

    dispatcher.listen('terrain', 'touchEnd', async ({point}) => {
      if (!terrainMesh && !freightTrain.isStarting()) {
        ridgeMesh = drawRidge(scene, ridgeHeights, point, true);
        if (!freightTrain.isWaitingForStart()) {
          await freightTrain.giveSignal();

          maxHeight = ridgeHeights.reduce((a, b) => Math.max(a, b), 0);
          terrainMesh = createTerrainMesh(scene, ridgeHeights, maxHeight);
          rumbleSound.play();

          dispatcher.stopListen('terrain', 'touchMove');
          dispatcher.stopListen('terrain', 'touchEnd');
        }
      }
    });

    dispatcher.listen('terrain', 'animate', async ({elapsedTime}) => {
      if (terrainMesh) {
        if (terrainGrowthProgress <= 1) {
          terrainMesh.scale.y = 0.5 * Math.sin(Math.PI * (terrainGrowthProgress - 0.5)) + 0.5;
          terrainGrowthProgress += elapsedTime / 3000;
        } else if (ridgeMesh) {
          removeMesh(scene, ridgeMesh);
          ridgeMesh = null;
          rockData = await createRocks(scene, terrainMesh);
        } else if (rockGrowthProgress <= 1 && rockData) {
          const rockSize = 0.5 * Math.sin(Math.PI * (rockGrowthProgress - 0.5)) + 0.5;
          rockGrowthProgress += elapsedTime / 1000;
          rockData.growRocks(rockSize);
        } else if (rockGrowthProgress > 1) {
          dispatcher.stopListen('terrain', 'animate');
          windSound.playAtPosition(new THREE.Vector2(0.5, maxHeight));
          const terrain = {
            getTerrainPointAtPoint: getTerrainPointAtPoint.bind(null, terrainMesh, maxHeight),
            getTerrainInfoAtPoint: getTerrainInfoAtPoint.bind(null, terrainMesh, maxHeight),
            findNearestTerrainInfo: findNearestTerrainInfo.bind(null, terrainMesh, maxHeight, ridgeHeights)
          };
          addDaws(scene, ridgeHeights, dispatcher);
          addCapricorns(scene, audio, terrain, dispatcher);
          addGroundhog(scene, audio, rockData.rocks, dispatcher);
          resolve(terrain);
        }
      }
    });
  });
};