import loadSvg from "../lib/loadSvg.js";
import selectRandom from "../lib/selectRandom.js";

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
}

const getCountOfTreesInRadius = (trees, point) => {
  return trees.reduce((count, tree) => {
    const distance = Math.sqrt(Math.pow(tree.position.x - point.x, 2) + Math.pow(tree.position.y - point.y, 2))
    return distance < SPREAD_RADIUS ? count + 1 : count;
  }, 0);
}

const addTree = (scene, terrainInfo, availableTree, trees) => {
  const tree = availableTree.mesh.clone();
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
    baseY: tree.position.y,
    offsetY: availableTree.offsetY,
    growthProgress: 0
  };
  trees.push(tree);
  scene.add(tree);
}

const spreadTree = (scene, availableTrees, terrain, clickPoint, trees) => {
  const randomClickPoint = getRandomClickPoint(clickPoint);
  const terrainInfo = terrain.getTerrainInfoAtPoint(randomClickPoint);
  if (terrainInfo) {
    const {item: availableTree, propability} = selectRandom(availableTrees, terrainInfo.height, terrainInfo.slope);
    if (availableTree) {
      const currentCountOfTrees = getCountOfTreesInRadius(trees, terrainInfo.point);
      const allowedCountOfTrees = Math.floor(MAX_TREES_IN_RADIUS * propability);
      if (currentCountOfTrees < allowedCountOfTrees) {
        addTree(scene, terrainInfo, availableTree, trees);
      }
    }
  }
}

export default async (scene, dispatcher, terrain) => {
  const availableTrees = [
    {
      mesh: await loadSvg('trees/pine-curve'),
      offsetY: -0.6,
      turnOnSlope: true,
      distribution: {
        height: {
          minimum: 0.4,
          optimum: 0.6,
          maximum: 0.9
        },
        slope: {
          minimum: 0.3,
          optimum: 0.35,
          maximum: 1.0
        }
      }
    },
    {
      mesh: await loadSvg('trees/pine-straight'),
      offsetY: -0.6,
      turnOnSlope: true,
      distribution: {
        height: {
          minimum: 0.4,
          optimum: 0.6,
          maximum: 0.9
        },
        slope: {
          minimum: 0.0,
          optimum: 0.0,
          maximum: 0.35
        }
      }
    },
    {
      mesh: await loadSvg('trees/fir'),
      offsetY: 0.3,
      turnOnSlope: false,
      distribution: {
        height: {
          minimum: 0,
          optimum: 0.4,
          maximum: 0.7
        },
        slope: {
          minimum: 0,
          optimum: 0.0,
          maximum: 0.5
        }
      }
    },
    {
      mesh: await loadSvg('trees/leaf'),
      offsetY: 0.1,
      turnOnSlope: false,
      distribution: {
        height: {
          minimum: 0,
          optimum: 0,
          maximum: 0.4
        },
        slope: {
          minimum: 0,
          optimum: 0,
          maximum: 0.3
        }
      }
    }
  ];

  const trees = [];
  let touching = false;
  let currentPoint = null;
  let countdownForNextTree = 0;

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

  dispatcher.listen('trees', 'animate', ({elapsedTime}) => {
    if (touching) {
      countdownForNextTree -= elapsedTime;
      if (countdownForNextTree <= 0) {
        spreadTree(scene, availableTrees, terrain, currentPoint, trees);
        countdownForNextTree = 100;
      }
    }

    trees.forEach(tree => {
      if (tree.userData.growthProgress <= 1) {
        const treeSize = 0.5 * Math.sin(Math.PI * (tree.userData.growthProgress - 0.5)) + 0.5;
        tree.userData.growthProgress += elapsedTime / 2000;
        tree.position.y = tree.userData.baseY +
          tree.userData.scale * tree.userData.offsetY * 0.7 +
          treeSize * tree.userData.scale * (1 + tree.userData.offsetY * 0.3);
        tree.scale.x = tree.userData.mirror * (tree.userData.scale * 0.1 + treeSize * tree.userData.scale * 0.9);
      }
    });

  });
};