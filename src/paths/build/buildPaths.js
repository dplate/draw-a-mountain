import loadGrounds from './loadGrounds.js';
import buildGround from './buildGround.js';
import buildWire from './buildWire.js';
import buildSignpost from './buildSignpost.js';
import calculateOpticalDistance from '../../lib/calculateOpticalDistance.js';
import loadSignpostParts from './loadSignpostParts.js';

const calculateSteps = (terrain, path) => {
  const [startPoint, endPoint] = path.nodes.map(node => node.terrainInfo.point);
  const line = new THREE.Line3(startPoint, endPoint);
  const opticalDistance = calculateOpticalDistance(startPoint, endPoint);
  const center = new THREE.Vector3();
  path.steps = [path.nodes[0].terrainInfo];
  const stepAmount = Math.floor(opticalDistance / 0.005);
  for (let i = 1; i <= stepAmount; i++) {
    line.at(Math.min(1, i / stepAmount), center);
    const terrainInfo = terrain.getTerrainInfoAtPoint(center, true);
    if (terrainInfo !== null) {
      path.steps.push(terrainInfo);
    }
  }
};

const buildPath = (scene, terrain, grounds, path) => {
  if (path.built) {
    return;
  }
  calculateSteps(terrain, path);

  for (let i = 1; i < path.steps.length; i++) {
    buildGround(grounds, path.steps[i - 1], path.steps[i]);
  }

  if (path.difficulty === 2) {
    buildWire(
      scene,
      path.steps[0],
      path.steps[Math.floor(path.steps.length / 3)],
      path.steps[Math.floor(path.steps.length * 2 / 3)],
      path.steps[path.steps.length - 1]
    )
  }

  path.built = true;
};

const addInstancedMesh = (scene, definition) => {
  const mesh = new THREE.InstancedMesh(definition.geometry, definition.material, definition.matrixes.length);
  mesh.name = definition.name;
  definition.matrixes.forEach((matrix, index) => {
    mesh.setMatrixAt(index, matrix);
  });
  scene.add(mesh);
}

export default async (scene, terrain, nodes) => {
  const grounds = loadGrounds();
  const signpostParts = loadSignpostParts();

  nodes.forEach(node => {
    node.paths.forEach(path => {
      buildPath(scene, terrain, grounds, path);
    });
    buildSignpost(signpostParts, node);
  });

  grounds.forEach(ground => addInstancedMesh(scene, ground));
  Object.values(signpostParts).forEach(part => addInstancedMesh(scene, part));
};