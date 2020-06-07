import selectRandom from '../lib/selectRandom.js';
import loadAvailableTrees from './loadAvailableTrees.js';

const SPREAD_RADIUS = 0.03;
const MAX_TREES_IN_RADIUS = 5;

const zVector = new THREE.Vector3(0, 0, 1);

const getRandomClickPoint = (point) => {
  const randomRadius = Math.random() * SPREAD_RADIUS;
  const randomAngle = Math.random() * 2 * Math.PI;
  return new THREE.Vector3(
    point.x + randomRadius * Math.cos(randomAngle),
    point.y + randomRadius * Math.sin(randomAngle),
    point.z
  )
};

const getCountOfTreesInRadius = (trees, point) => {
  return trees.reduce((count, tree) => {
    const distance = Math.sqrt(Math.pow(tree.position.x - point.x, 2) + Math.pow(tree.position.y - point.y, 2))
    return distance < SPREAD_RADIUS ? count + 1 : count;
  }, 0);
};

const addTree = (terrainInfo, availableTree, trees) => {
  const tree = availableTree.instancedObject.addInstance();
  const scale = 0.02 + Math.random() * 0.01;
  const mirror = availableTree.turnOnSlope && terrainInfo.normal.x < 0 ? -1 : 1;
  tree.scale.x = 0;
  tree.scale.y = scale;
  tree.position.copy(terrainInfo.point);
  tree.userData = {
    scale,
    mirror,
    terrainPoint: terrainInfo.point,
    stumpOffsetY: availableTree.stumpOffsetY,
    growthProgress: 0,
    swingingFactor: 0
  };
  trees.push(tree);
};

const spreadTree = (scene, availableTrees, terrain, clickPoint, trees) => {
  const randomClickPoint = getRandomClickPoint(clickPoint);
  const terrainInfo = terrain.getTerrainInfoAtPoint(randomClickPoint);
  if (terrainInfo) {
    const {item: availableTree, propability} = selectRandom(availableTrees, terrainInfo.height, terrainInfo.slope);
    if (availableTree) {
      const currentCountOfTrees = getCountOfTreesInRadius(trees, terrainInfo.point);
      const allowedCountOfTrees = Math.floor(MAX_TREES_IN_RADIUS * propability);
      if (currentCountOfTrees < allowedCountOfTrees) {
        addTree(terrainInfo, availableTree, trees);
        return true;
      }
    }
  }
  return false;
};

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
}

export default async (scene, freightTrain, terrain, dispatcher) => {
  return new Promise(async (resolve) => {
    const availableTrees = await loadAvailableTrees(scene);
    const trees = [];

    let touching = false;
    let currentPoint = null;
    let countdownForNextTree = 0;

    await freightTrain.deliver();

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