import loadSvg from "../lib/loadSvg.js";

const spreadRadius = 0.03;

const getRandomPoint = (point) => {
  const randomRadius = Math.random() * spreadRadius;
  const randomAngle = Math.random() * 2 * Math.PI;
  return new THREE.Vector3(
    point.x + randomRadius * Math.cos(randomAngle),
    point.y + randomRadius * Math.sin(randomAngle),
    point.z
  )
}

const spreadTree = (scene, meshes, terrain, point, trees) => {
  const randomPoint = getRandomPoint(point);
  const terrainInfo = terrain.getTerrainInfoAtPoint(randomPoint);
  if (terrainInfo) {
    const tree = meshes[Math.floor(Math.random() * meshes.length)].clone();
    const scale = 0.015 + Math.random() * 0.015;
    tree.scale.x = 0;
    tree.scale.y = scale;
    tree.position.x = terrainInfo.point.x;
    tree.position.y = terrainInfo.point.y;
    tree.position.z = terrainInfo.point.z;
    tree.userData = {
      scale,
      baseY: tree.position.y,
      growthProgress: 0
    };
    trees.push(tree);
    scene.add(tree);
  }
}

export default async (scene, dispatcher, terrain) => {
  const meshes = [
    await loadSvg('trees/fir')
  ]

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
        spreadTree(scene, meshes, terrain, currentPoint, trees);
        countdownForNextTree = 250;
      }
    }

    trees.forEach(tree => {
      if (tree.userData.growthProgress <= 1) {
        const treeSize = 0.5 * Math.sin(Math.PI * (tree.userData.growthProgress - 0.5)) + 0.5;
        tree.userData.growthProgress += elapsedTime / 2000;
        tree.position.y = tree.userData.baseY + tree.userData.scale * 0.2 + treeSize * tree.userData.scale * 1.1;
        tree.scale.x = tree.userData.scale * 0.1 + treeSize * tree.userData.scale * 0.9;
      }
    });

  });
};