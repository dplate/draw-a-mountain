import selectRandom from '../lib/selectRandom.js';

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

const addTree = (terrainInfo, availableTree, availableSounds, trees) => {
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
    type: availableTree.type,
    stumpOffsetY: availableTree.stumpOffsetY,
    growthProgress: 0,
    swingingFactor: 0,
    birdSounds: availableSounds.birds.map(availableBird => availableBird.addInstance()),
    timeUntilNextBird: Math.random() * 10 * 60 * 1000
  };
  const blobSoundInstance = availableSounds.blop.addInstance();
  blobSoundInstance.playAtPosition(tree.position);
  trees.push(tree);
};

export default (scene, availableTrees, availableSounds, terrain, clickPoint, trees) => {
  const randomClickPoint = getRandomClickPoint(clickPoint);
  const terrainInfo = terrain.getTerrainInfoAtPoint(randomClickPoint);
  if (terrainInfo) {
    const {item: availableTree, propability} = selectRandom(availableTrees, terrainInfo.height, terrainInfo.slope);
    if (availableTree) {
      const currentCountOfTrees = getCountOfTreesInRadius(trees, terrainInfo.point);
      const allowedCountOfTrees = Math.floor(MAX_TREES_IN_RADIUS * propability);
      if (currentCountOfTrees < allowedCountOfTrees) {
        addTree(terrainInfo, availableTree, availableSounds, trees);
        return true;
      }
    }
  }
  return false;
};