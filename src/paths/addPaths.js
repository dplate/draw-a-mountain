import findSnapNode from "./findSnapNode.js";
import findNearestTerrain from "../lib/findNearestTerrain.js";

const MAX_PROBE_LENGTH = 0.05;

const defaultColor = new THREE.Color(0x555555);
const deleteColor = new THREE.Color(0xff00ff);

const addNode = (scene, nodes, point) => {
  const geometry = new THREE.CircleGeometry(0.01, 16);
  const material = new THREE.MeshBasicMaterial({color: defaultColor});
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.x = point.x;
  mesh.position.y = point.y;
  mesh.position.z = 0;
  scene.add(mesh);

  const node = {
    mesh,
    paths: []
  }
  nodes.push(node);

  return node;
};

const removeNodeWhenLonely = (scene, nodes, node) => {
  if (node.paths.length < 1) {
    node.mesh.geometry.dispose();
    node.mesh.material.dispose();
    scene.remove(node.mesh);
    const nodeIndex = nodes.indexOf(node);
    if (nodeIndex >= 0) {
      nodes.splice(nodeIndex, 1);
    }
  }
};

const startProbe = (scene, terrain, nodes, point) => {
  const probePoint = findNearestTerrain(terrain, point).point;
  probePoint.z = point.z;
  const currentNode = findSnapNode(nodes, probePoint) || addNode(scene, nodes, probePoint);
  return {
    currentNode,
    point: currentNode.mesh.position,
    snapNode: currentNode,
    path: addProbePath(scene, currentNode)
  };
}

const createPathMesh = (point1, point2) => {
  const geometry = new THREE.Geometry();
  geometry.vertices.push(point1);
  geometry.vertices.push(point2);
  const line = new MeshLine();
  line.setGeometry(geometry);
  const material = new MeshLineMaterial({lineWidth: 0.005, transparent: true, opacity: 0.5});
  return new THREE.Mesh(line.geometry, material);
}

const addProbePath = (scene, currentNode) => {
  const mesh = createPathMesh(currentNode.mesh.position, currentNode.mesh.position);
  scene.add(mesh);

  const path = {
    nodes: [currentNode],
    mesh
  };
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
  pathToRemove.mesh.geometry.dispose();
  pathToRemove.mesh.material.dispose();
  scene.remove(pathToRemove.mesh);
};

const findExistingPath = (node1, node2) => {
  return node1.paths.find(path => path.nodes.includes(node2))
};

const updateProbePathColor = (probe) => {
  if (probe.snapNode && findExistingPath(probe.snapNode, probe.currentNode)) {
    probe.path.mesh.material.color = deleteColor;
  } else {
    probe.path.mesh.material.color = defaultColor;
  }
};

const updateProbe = (scene, terrain, nodes, touchPoint, probe) => {
  const nodePoint = probe.currentNode.mesh.position;
  const idealPoint = new THREE.Vector3();
  idealPoint.subVectors(touchPoint, nodePoint);
  idealPoint.setLength(Math.min(idealPoint.length(), MAX_PROBE_LENGTH));
  idealPoint.add(nodePoint);
  const probePoint = findNearestTerrain(terrain, idealPoint).point;
  probePoint.z = idealPoint.z;

  const snapNode = findSnapNode(nodes, probePoint, probe.currentNode);
  if (snapNode) {
    probe.point = snapNode.mesh.position;
    probe.snapNode = snapNode;
  } else {
    probe.point = probePoint;
    probe.snapNode = null;
  }

  removePath(scene, probe.path);
  probe.path.mesh = createPathMesh(probe.currentNode.mesh.position, probe.point);
  scene.add(probe.path.mesh);

  updateProbePathColor(probe);
};

const endProbe = (scene, nodes, probe, andStartNext) => {
  if (!probe.snapNode) {
    probe.snapNode = addNode(scene, nodes, probe.point);
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

export default async (scene, menu, terrain, dispatcher) => {
  return new Promise(async resolve => {
    const nodes = [];
    let probe = null;
    let waitingForNext = false;

    dispatcher.listen('paths', 'touchStart', ({point}) => {
      probe = startProbe(scene, terrain, nodes, point);
    });

    dispatcher.listen('paths', 'touchMove', ({point}) => {
      if (probe) {
        updateProbe(scene, terrain, nodes, point, probe);

        if (probe.currentNode.mesh.position.distanceTo(point) >= MAX_PROBE_LENGTH * 2) {
          endProbe(scene, nodes, probe, true);
        }
      }
    });

    dispatcher.listen('paths', 'touchEnd', async () => {
      if (probe) {
        endProbe(scene, nodes, probe, false);
        probe = null;

        if (!waitingForNext) {
          waitingForNext = true;
          await menu.waitForNext();

          dispatcher.stopListen('paths', 'touchStart');
          dispatcher.stopListen('paths', 'touchMove');
          dispatcher.stopListen('paths', 'touchEnd');

          resolve();
        }
      }
    });
  });
};