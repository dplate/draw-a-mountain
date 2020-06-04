import loadGrounds from "./loadGrounds.js";
import buildGround from "./buildGround.js";
import buildWire from "./buildWire.js";
import buildSignpost from "./buildSignpost.js";
import calculateOpticalDistance from "../../lib/calculateOpticalDistance.js";

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

const buildPath = (scene, terrain, meshes, path) => {
  if (path.built) {
    return;
  }
  calculateSteps(terrain, path);

  const groundGroup = new THREE.Group();
  for (let i = 1; i < path.steps.length; i++) {
    buildGround(groundGroup, meshes.grounds, path.steps[i - 1], path.steps[i]);
  }
  groundGroup.name = 'ground';
  scene.add(groundGroup);

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

export default async (scene, terrain, nodes) => {
  const meshes = {
    grounds: loadGrounds()
  };

  nodes.forEach(node => {
    node.paths.forEach(path => {
      buildPath(scene, terrain, meshes, path);
    });
    buildSignpost(scene, node);
  });
  return {};
};