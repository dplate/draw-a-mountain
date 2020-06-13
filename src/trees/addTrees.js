import loadAvailableTrees from './loadAvailableTrees.js';
import spreadTree from './spreadTree.js';
import findNearestTerrain from '../lib/findNearestTerrain.js';

const zVector = new THREE.Vector3(0, 0, 1);

const animateTrees = (trees, elapsedTime) => {
  trees.forEach(tree => {
    if (tree.userData.growthProgress <= 1) {
      const treeSize = 0.5 * Math.sin(Math.PI * (tree.userData.growthProgress - 0.5)) + 0.5;
      tree.userData.growthProgress += elapsedTime / 2000;
      tree.scale.x = tree.userData.mirror * tree.userData.scale * (0.3 + treeSize * 0.7);
      tree.scale.y = tree.userData.scale * (0.5 + treeSize * 0.5);
    } else if (tree.scale.y > 0) {
      tree.userData.swingingFactor += elapsedTime * 0.001;
      tree.quaternion.setFromAxisAngle(zVector, Math.sin(tree.userData.swingingFactor) / 20);
    }
    tree.update();
  });
};

const fellTrees = (trees, point) => {
  trees.forEach(tree => {
    if (tree.userData.stumpOffsetY && point.distanceTo(tree.userData.terrainPoint) < 0.03 && tree.scale.y > 0) {
      tree.visible = true;
      tree.scale.y *= -1;
      tree.position.y = tree.userData.terrainPoint.y - tree.userData.stumpOffsetY * tree.userData.scale;
      tree.update();
    }
  });
};

const handleEnd = async (dispatcher, freightTrain, resolve) => {
  await freightTrain.giveSignal();
  dispatcher.stopListen('trees', 'touchStart');
  dispatcher.stopListen('trees', 'touchMove');
  dispatcher.stopListen('trees', 'touchEnd');
  resolve();
};

const setTip = (tip, terrain) => {
  const path = new THREE.Path();
  const point = new THREE.Vector3(0.2, 10, 0);
  const terrainInfo1 = findNearestTerrain(terrain, point);
  path.moveTo(terrainInfo1.point.x, terrainInfo1.point.y * 0.1);
  const terrainInfo2 = findNearestTerrain(terrain, point.set(0.8, terrainInfo1.point.y * 0.5));
  const terrainInfo3 = findNearestTerrain(terrain, point.set(0.65, terrainInfo1.point.y * 2));
  path.splineThru([
    new THREE.Vector2(terrainInfo2.point.x, terrainInfo2.point.y),
    new THREE.Vector2(terrainInfo3.point.x, terrainInfo3.point.y * 0.75)
  ]);

  tip.setTip(path, 8000);
};

export default async (scene, freightTrain, tip, terrain, dispatcher) => {
  return new Promise(async (resolve) => {
    const availableTrees = await loadAvailableTrees(scene);
    const trees = [];

    let touching = false;
    let currentPoint = null;
    let countdownForNextTree = 0;

    await freightTrain.deliver(['fir', 'leaf']);
    setTip(tip, terrain);

    dispatcher.listen('trees', 'touchStart', ({point}) => {
      if (!freightTrain.isStarting()) {
        touching = true;
        currentPoint = point;
      }
    });

    dispatcher.listen('trees', 'touchMove', ({point}) => {
      if (!freightTrain.isStarting()) {
        touching = true;
        currentPoint = point;
      }
    });

    dispatcher.listen('trees', 'touchEnd', () => {
      touching = false;
      currentPoint = null;
      countdownForNextTree = 0;
    });

    dispatcher.listen('trees', 'animate', async ({elapsedTime}) => {
      if (touching) {
        countdownForNextTree -= elapsedTime;
        if (countdownForNextTree <= 0) {
          countdownForNextTree = 100;
          const treeCreated = spreadTree(scene, availableTrees, terrain, currentPoint, trees);
          if (treeCreated && !freightTrain.isWaitingForStart()) {
            handleEnd(dispatcher, freightTrain, resolve.bind(null, {
              fellTrees: fellTrees.bind(null, trees)
            }));
          }
        }
      }

      animateTrees(trees, elapsedTime);
    });
  });
};