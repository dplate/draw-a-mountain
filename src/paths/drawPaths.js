import findSnapNode from "./findSnapNode.js";
import findNearestTerrain from "../lib/findNearestTerrain.js";
import updateRouteDifficulties from "./updateRouteDifficulties.js";
import difficultyColors from "./difficultyColors.js";

const MAX_PROBE_LENGTH = 0.05;

const deleteColor = new THREE.Color(0xff00ff);

const addNode = (scene, nodes, terrainInfo, entrance = false) => {
  const geometry = new THREE.CircleGeometry(0.01, 16);
  const material = new THREE.MeshBasicMaterial({color: 0x000000, transparent: true, opacity: 0.5});
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.x = terrainInfo.point.x;
  mesh.position.y = terrainInfo.point.y;
  mesh.position.z = 0;
  scene.add(mesh);

  const geometryPoint = new THREE.CircleGeometry(0.005, 16);
  const materialPoint = new THREE.MeshBasicMaterial({color: 0x000000});
  const pointMesh = new THREE.Mesh(geometryPoint, materialPoint);
  pointMesh.position.x = terrainInfo.point.x;
  pointMesh.position.y = terrainInfo.point.y;
  pointMesh.position.z = 0.01;
  scene.add(pointMesh);

  const node = {
    mesh,
    pointMesh,
    terrainInfo,
    entrance,
    paths: []
  }
  nodes.push(node);

  return node;
};

const removeNodeWhenLonely = (scene, nodes, node) => {
  if (!node.entrance && node.paths.length < 1) {
    node.mesh.geometry.dispose();
    node.mesh.material.dispose();
    scene.remove(node.mesh);
    node.pointMesh.geometry.dispose();
    node.pointMesh.material.dispose();
    scene.remove(node.pointMesh);
    const nodeIndex = nodes.indexOf(node);
    if (nodeIndex >= 0) {
      nodes.splice(nodeIndex, 1);
    }
  }
};

const startProbe = (scene, terrain, nodes, point) => {
  const terrainInfo = findNearestTerrain(terrain, point);
  const probePoint = terrainInfo.point.clone();
  probePoint.z = point.z;
  const currentNode = findSnapNode(nodes, probePoint) || addNode(scene, nodes, terrainInfo);
  return {
    currentNode,
    point: currentNode.mesh.position,
    terrainInfo: currentNode.terrainInfo,
    snapNode: currentNode,
    path: addProbePath(scene, currentNode)
  };
}

const addPathMeshes = (scene, path, point1, point2) => {
  const geometry = new THREE.Geometry();
  geometry.vertices.push(point1);
  geometry.vertices.push(point2);
  const line = new MeshLine();
  line.setGeometry(geometry);

  const routeMaterial = new MeshLineMaterial({lineWidth: 0.006, transparent: true, opacity: 0.5});
  path.routeMesh = new THREE.Mesh(line.geometry, routeMaterial);
  path.routeMesh.translateZ(0.005);
  scene.add(path.routeMesh);

  const material = new MeshLineMaterial({lineWidth: 0.002, transparent: true, opacity: 0.5});
  path.mesh = new THREE.Mesh(line.geometry, material);
  path.mesh.translateZ(0.005);
  scene.add(path.mesh);
}

const addProbePath = (scene, currentNode) => {
  const path = {
    nodes: [currentNode],
    difficulty: 0
  };
  addPathMeshes(scene, path, currentNode.mesh.position, currentNode.mesh.position);
  currentNode.paths.push(path);
  return path;
};

const removePathFromNode = (scene, node, pathToRemove) => {
  node.paths = node.paths.filter(path => path !== pathToRemove);
};

const removePath = (scene, pathToRemove, nodes) => {
  if (nodes) {
    const affectedNodes = nodes.filter(node => node.paths.includes(pathToRemove));
    affectedNodes.forEach(node => {
      removePathFromNode(scene, node, pathToRemove)
    });
  }
  pathToRemove.routeMesh.geometry.dispose();
  pathToRemove.routeMesh.material.dispose();
  scene.remove(pathToRemove.routeMesh);

  pathToRemove.mesh.geometry.dispose();
  pathToRemove.mesh.material.dispose();
  scene.remove(pathToRemove.mesh);
};

const findExistingPath = (node1, node2) => {
  return node1.paths.find(path => path.nodes.includes(node2))
};

const updateProbePathDifficulty = (probe) => {
  const slope = (probe.currentNode.terrainInfo.slope + probe.terrainInfo.slope) / 2;
  if (slope < 0.1) {
    probe.path.difficulty = 0;
  } else if (slope < 0.4) {
    probe.path.difficulty = 1;
  } else {
    probe.path.difficulty = 2;
  }
  probe.path.routeDifficulty = probe.path.difficulty;
};

const updateProbePathColor = (probe) => {
  if (probe.snapNode && findExistingPath(probe.snapNode, probe.currentNode)) {
    probe.path.mesh.material.color = deleteColor;
  } else {
    probe.path.mesh.material.color = difficultyColors[probe.path.difficulty];
  }
};

const updateProbe = (scene, terrain, nodes, touchPoint, probe) => {
  const nodePoint = probe.currentNode.mesh.position;
  const idealPoint = new THREE.Vector3();
  idealPoint.subVectors(touchPoint, nodePoint);
  idealPoint.setLength(Math.min(idealPoint.length(), MAX_PROBE_LENGTH));
  idealPoint.add(nodePoint);
  const terrainInfo = findNearestTerrain(terrain, idealPoint);
  const probePoint = terrainInfo.point.clone();
  probePoint.z = idealPoint.z;

  const snapNode = findSnapNode(nodes, probePoint, probe.currentNode);
  if (snapNode) {
    probe.point = snapNode.mesh.position;
    probe.terrainInfo = snapNode.terrainInfo;
    probe.snapNode = snapNode;
  } else {
    probe.point = probePoint;
    probe.terrainInfo = terrainInfo;
    probe.snapNode = null;
  }

  removePath(scene, probe.path);
  addPathMeshes(scene, probe.path, probe.currentNode.mesh.position, probe.point);

  updateProbePathDifficulty(probe);
  updateProbePathColor(probe);
};

const endProbe = (scene, nodes, probe, andStartNext) => {
  if (!probe.snapNode) {
    probe.snapNode = addNode(scene, nodes, probe.terrainInfo);
  }

  const existingPath = findExistingPath(probe.snapNode, probe.currentNode);
  if (existingPath) {
    removePath(scene, probe.path, nodes);
    if (probe.snapNode !== probe.currentNode) {
      removePath(scene, existingPath, nodes);
    }
  } else {
    probe.snapNode.paths.push(probe.path);
    probe.path.nodes.push(probe.snapNode);
    probe.path.routeMesh.material.opacity = 1.0;
    probe.path.mesh.material.opacity = 1.0;
  }

  if (probe.snapNode !== probe.currentNode) {
    removeNodeWhenLonely(scene, nodes, probe.currentNode);
  }

  if (andStartNext) {
    probe.currentNode = probe.snapNode;
    probe.point = probe.currentNode.mesh.position;
    probe.path = addProbePath(scene, probe.currentNode);
  } else {
    removeNodeWhenLonely(scene, nodes, probe.snapNode);
  }
};

const createEntranceNodes = (scene, restaurant, cableCar) => {
  const nodes = [];
  restaurant.entrances.forEach(entrance => addNode(scene, nodes, entrance, true));
  cableCar.entrances.forEach(entrance => addNode(scene, nodes, entrance, true));
  return nodes;
};

export default async (scene, menu, terrain, restaurant, cableCar, dispatcher) => {
  return new Promise(async resolve => {
    const nodes = createEntranceNodes(scene, restaurant, cableCar);
    let probe = null;
    let waitingForNext = false;

    dispatcher.listen('paths', 'touchStart', ({point}) => {
      probe = startProbe(scene, terrain, nodes, point);
      updateRouteDifficulties(nodes);
    });

    dispatcher.listen('paths', 'touchMove', ({point}) => {
      if (probe) {
        updateProbe(scene, terrain, nodes, point, probe);

        if (probe.currentNode.mesh.position.distanceTo(point) >= MAX_PROBE_LENGTH * 2) {
          endProbe(scene, nodes, probe, true);
        }
        updateRouteDifficulties(nodes);
      }
    });

    dispatcher.listen('paths', 'touchEnd', async () => {
      if (probe) {
        endProbe(scene, nodes, probe, false);
        updateRouteDifficulties(nodes);
        probe = null;

        if (!waitingForNext) {
          waitingForNext = true;
          await menu.waitForNext();

          dispatcher.stopListen('paths', 'touchStart');
          dispatcher.stopListen('paths', 'touchMove');
          dispatcher.stopListen('paths', 'touchEnd');

          resolve(nodes);
        }
      }
    });
  });
};