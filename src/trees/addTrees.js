import selectRandom from "../lib/selectRandom.js";
import loadAvailableTrees from "./loadAvailableTrees.js";

const SPREAD_RADIUS = 0.03;
const MAX_TREES_IN_RADIUS = 5;

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
  const tree = availableTree.mesh.addInstance();
  const scale = 0.02 + Math.random() * 0.01;
  const mirror = availableTree.turnOnSlope && terrainInfo.normal.x < 0 ? -1 : 1;
  tree.scale.x = 0;
  tree.scale.y = scale;
  tree.position.x = terrainInfo.point.x;
  tree.position.y = terrainInfo.point.y;
  tree.position.z = terrainInfo.point.z;
  tree.userData = {
    scale,
    mirror,
    terrainPoint: terrainInfo.point,
    offsetY: availableTree.offsetY,
    stumpOffsetY: availableTree.stumpOffsetY,
    growthProgress: 0,
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
  let growthDone = true;
  trees.forEach(tree => {
    if (tree.userData.growthProgress <= 1) {
      growthDone = false;
      const treeSize = 0.5 * Math.sin(Math.PI * (tree.userData.growthProgress - 0.5)) + 0.5;
      tree.userData.growthProgress += elapsedTime / 2000;
      tree.position.y = tree.userData.terrainPoint.y +
        tree.userData.scale * tree.userData.offsetY * 0.7 +
        treeSize * tree.userData.scale * (1 + tree.userData.offsetY * 0.3);
      tree.scale.x = tree.userData.mirror * (tree.userData.scale * 0.1 + treeSize * tree.userData.scale * 0.9);
      tree.update();
    }
  });
  return growthDone;
};

const fellTrees = (trees, point) => {
  trees.forEach(tree => {
    if (point.distanceTo(tree.userData.terrainPoint) < 0.03 && tree.userData.stumpOffsetY && tree.scale.y > 0) {
      tree.visible = true;
      tree.scale.y *= -1;
      tree.position.y = tree.userData.terrainPoint.y - tree.userData.stumpOffsetY * tree.userData.scale;
      tree.update();
    }
  });
};

const handleNextButton = async (dispatcher, menu, resolve) => {
  await menu.waitForNext();
  dispatcher.stopListen('trees', 'touchStart');
  dispatcher.stopListen('trees', 'touchMove');
  dispatcher.stopListen('trees', 'touchEnd');
  resolve();
}

export default async (scene, dispatcher, menu, terrain) => {
  return new Promise(async (resolve) => {
    const availableTrees = await loadAvailableTrees(scene);
    const trees = [];

    let touching = false;
    let currentPoint = null;
    let countdownForNextTree = 0;
    let firstTreePlaced = false;
    let growthDone = true;

    dispatcher.listen('trees', 'touchStart', ({point}) => {
      touching = true;
      currentPoint = point;
    });

    dispatcher.listen('trees', 'touchMove', ({point}) => {
      touching = true;
      currentPoint = point;
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
          if (growthDone && treeCreated) {
            growthDone = false;
          }
          if (treeCreated && !firstTreePlaced) {
            firstTreePlaced = true;
            handleNextButton(dispatcher, menu, resolve.bind(null, {
              fellTrees: fellTrees.bind(null, trees)
            }));
          }
        }
      }

      if (!growthDone) {
        growthDone = animateTrees(trees, elapsedTime);
      }
    });
  });
};