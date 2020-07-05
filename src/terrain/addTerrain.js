import drawRidge from './drawRidge.js';
import createTerrainMesh, {MAX_QUAD_X} from './createTerrainMesh.js';
import createRocks from './createRocks.js';
import getTerrainInfoAtPoint from './getTerrainInfoAtPoint.js';
import removeMesh from '../lib/removeMesh.js';

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

export default ({scene, sound, dispatcher}, freightTrain, tip) => {
  return new Promise(async (resolve) => {
    const ridgeHeights = Array(MAX_QUAD_X + 1).fill(null);
    let maxHeight = null;
    let ridgeMesh = null;
    let terrainMesh = null;
    let terrainGrowthProgress = 0.001;
    let rockGrowthProgress = 0;
    let growRocks = null;

    const rumbleAudio = await sound.loadAudio('terrain/rumble');
    const windAudio = await sound.loadAudio('terrain/wind');
    windAudio.setLoop(true);

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
          terrainMesh.add(rumbleAudio);
          rumbleAudio.play()

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
          growRocks = await createRocks(scene, terrainMesh);
        } else if (rockGrowthProgress <= 1 && growRocks) {
          const rockSize = 0.5 * Math.sin(Math.PI * (rockGrowthProgress - 0.5)) + 0.5;
          rockGrowthProgress += elapsedTime / 1000;
          growRocks(rockSize);
        } else if (rockGrowthProgress > 1) {
          dispatcher.stopListen('terrain', 'animate');
          windAudio.play();
          resolve({
            getTerrainInfoAtPoint: getTerrainInfoAtPoint.bind(null, terrainMesh, maxHeight)
          });
        }
      }
    });
  });
};