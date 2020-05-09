import loadGrounds from "./loadGrounds.js";
import buildGround from "./buildGround.js";
import buildWire from "./buildWire.js";
import buildSignpost from "./buildSignpost.js";

const calculateSteps = (terrain, path) => {
  const [startPoint, endPoint] = path.nodes.map(node => node.terrainInfo.point);
  const line = new THREE.Line3(startPoint, endPoint);
  const opticalDistance = Math.sqrt(
    (endPoint.x - startPoint.x) * (endPoint.x - startPoint.x) +
    (endPoint.y - startPoint.y) * (endPoint.y - startPoint.y)
  );
  const center = new THREE.Vector3();
  path.steps = [path.nodes[0].terrainInfo];
  const stepAmount = Math.floor(opticalDistance / 0.005);
  for (let i = 1; i <= stepAmount; i++) {
    line.at(Math.min(1, i / stepAmount), center);
    path.steps.push(terrain.getTerrainInfoAtPoint(center, true));
  }
};

const buildPath = (scene, terrain, meshes, path) => {
  if (path.built) {
    return;
  }
  calculateSteps(terrain, path);

  for (let i = 1; i < path.steps.length; i++) {
    buildGround(scene, meshes.grounds, path.steps[i - 1], path.steps[i]);
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