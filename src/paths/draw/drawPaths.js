import findSnapNode from './findSnapNode.js';
import findNearestTerrain from '../../lib/findNearestTerrain.js';
import updateRouteDifficulties from './updateRouteDifficulties.js';
import difficultyColors from './difficultyColors.js';
import removeMesh from '../../lib/removeMesh.js';
import addNode from './addNode.js';
import createEntranceNodes from './createEntranceNodes.js';
import {MIN_Z} from '../../lib/constants.js';
import calculateOpticalDistance from '../../lib/calculateOpticalDistance.js';
import checkNodeConnection from './checkNodeConnection.js';
import setTip from './setTip.js';
import playAudio from '../../lib/playAudio.js';
import getConstructionAudio from '../../lib/getConstructionAudio.js';

const MAX_PROBE_LENGTH = 0.05;

const deleteColor = new THREE.Color(0xff00ff);

const removeNodeMesh = (scene, node) => {
  removeMesh(scene, node.mesh);
  delete node.mesh;

  removeMesh(scene, node.pointMesh);
  delete node.pointMesh;
};

const removeNodeWhenLonely = (scene, nodes, node) => {
  if (node.entrances.length + node.paths.length === 0) {
    removeNodeMesh(scene, node);
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
  path.routeMesh.translateZ(2 * MIN_Z);
  scene.add(path.routeMesh);

  const material = new MeshLineMaterial({lineWidth: 0.002, transparent: true, opacity: 0.5});
  path.mesh = new THREE.Mesh(line.geometry, material);
  path.mesh.translateZ(3 * MIN_Z);
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

const removePathMesh = (scene, path) => {
  if (path.routeMesh) {
    removeMesh(scene, path.routeMesh);
    delete path.routeMesh;
  }

  if (path.mesh) {
    removeMesh(scene, path.mesh);
    delete path.mesh;
  }
};

const removePath = (scene, pathToRemove, nodes) => {
  if (nodes) {
    const affectedNodes = nodes.filter(node => node.paths.includes(pathToRemove));
    affectedNodes.forEach(node => {
      removePathFromNode(scene, node, pathToRemove)
    });
  }
  removePathMesh(scene, pathToRemove);
};

const findExistingPath = (node1, node2) => {
  return node1.paths.find(path => path.nodes.includes(node2))
};

const updateProbePathDifficulty = (probe) => {
  const slope = (probe.currentNode.terrainInfo.slope + probe.terrainInfo.slope) / 2;
  if (slope < 0.17) {
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
  idealPoint.z = 0;
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

const endProbe = (scene, wiringAudio, cutAudio, nodes, probe, andStartNext) => {
  if (!probe.snapNode) {
    probe.snapNode = addNode(scene, nodes, probe.terrainInfo);
  }

  const existingPath = findExistingPath(probe.snapNode, probe.currentNode);
  if (existingPath) {
    removePath(scene, probe.path, nodes);
    if (probe.snapNode !== probe.currentNode) {
      removePath(scene, existingPath, nodes);
    }
    playAudio(cutAudio);
  } else {
    probe.snapNode.paths.push(probe.path);
    probe.path.nodes.push(probe.snapNode);
    probe.path.routeMesh.material.opacity = 1.0;
    probe.path.mesh.material.opacity = 1.0;
    playAudio(wiringAudio);
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

const removeAllMeshes = (scene, nodes) => {
  nodes.forEach(node => {
    node.paths.forEach(path => removePathMesh(scene, path));
    removeNodeMesh(scene, node);
  });
};

const updatePathInfos = (tip, nodes) => {
  checkNodeConnection(nodes);
  updateRouteDifficulties(nodes);
  if (!areAllNodesWithEntrancesConnected(nodes)) {
    setTip(tip, nodes);
  }
}

const areAllNodesWithEntrancesConnected = (nodes) => {
  return !nodes.find(node => node.entrances.length > 0 && !node.connected);
}

export default async ({scene, sound, dispatcher}, freightTrain, tip, terrain, pois) => {
  return new Promise(async resolve => {
    const nodes = createEntranceNodes(scene, terrain, pois);
    updatePathInfos(tip, nodes);
    const wiringAudio = await sound.loadAudio('paths/wiring');
    const cutAudio = await sound.loadAudio('paths/cut');
    const constructionAudio = await getConstructionAudio(sound);

    let probe = null;

    dispatcher.listen('paths', 'touchStart', ({point}) => {
      if (!freightTrain.isStarting()) {
        probe = startProbe(scene, terrain, nodes, point);
        updatePathInfos(tip, nodes);
      }
    });

    dispatcher.listen('paths', 'touchMove', ({point}) => {
      if (probe && !freightTrain.isStarting()) {
        updateProbe(scene, terrain, nodes, point, probe);

        if (calculateOpticalDistance(probe.currentNode.mesh.position, point) >= MAX_PROBE_LENGTH * 2) {
          endProbe(scene, wiringAudio, cutAudio, nodes, probe, true);
        }
        updatePathInfos(tip, nodes);
      }
    });

    dispatcher.listen('paths', 'touchEnd', async () => {
      if (probe) {
        endProbe(scene, wiringAudio, cutAudio, nodes, probe, false);
        updatePathInfos(tip, nodes);
        probe = null;

        if (!freightTrain.isWaitingForStart()) {
          if (areAllNodesWithEntrancesConnected(nodes)) {
            await freightTrain.giveSignal();

            dispatcher.stopListen('paths', 'touchStart');
            dispatcher.stopListen('paths', 'touchMove');
            dispatcher.stopListen('paths', 'touchEnd');

            removeAllMeshes(scene, nodes);

            constructionAudio.play();

            resolve(nodes);
          }
        } else {
          if (!areAllNodesWithEntrancesConnected(nodes)) {
            freightTrain.revokeSignal();
            setTip(tip, nodes);
          }
        }
      }
    });
  });
};