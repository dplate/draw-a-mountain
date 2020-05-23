import initWalkData from "./initWalkData.js";
import getPersonDirection from "../../lib/getPersonDirection.js";
import initNavigateData from "./initNavigateData.js";

const signPostPosition = new THREE.Vector3();

const findNavigator = (hikers, group) => {
  return hikers.find(hiker => group.includes(hiker.person) && hiker.person.navigator);
};

const getHikerForWaitTo = (node, hikers, group) => {
  return hikers.find(hiker =>
    group.includes(hiker.person) && (hiker.action !== 'navigate' || hiker.data.node !== node)
  );
};

const findBestNextVisit = (hiker) => {
  const possibleVisits = hiker.visits.filter(visit => {
    if (visit.path && hiker.data.node.paths.find(path => path === visit.path)) {
      return true;
    }
    return visit.entrance && hiker.data.node.entrance === visit.entrance;
  });
  const sortedPossibleVisits = possibleVisits.sort((visit1, visit2) => {
    return visit1.lastSeen - visit2.lastSeen;
  });
  const bestNextVisits = sortedPossibleVisits.filter(visit => visit.lastSeen === sortedPossibleVisits[0].lastSeen);
  const bestNextVisit = bestNextVisits[Math.floor(Math.random() * bestNextVisits.length)];
  bestNextVisit.lastSeen = Date.now();
  return bestNextVisit;
};

const waitForOtherHiker = (hiker, otherHiker) => {
  hiker.person.animation = 'standing';
  hiker.person.direction = getPersonDirection(hiker.person.position, otherHiker.person.position);
};

const lookAtSignPost = (hiker) => {
  hiker.person.animation = 'standing';
  signPostPosition.copy(hiker.data.node.terrainInfo.point);
  signPostPosition.z += 0.05;
  hiker.person.direction = getPersonDirection(hiker.person.position, signPostPosition);
};

const resolveGroup = (hikers, group) => {
  hikers.forEach(hiker => {
    if (group.includes(hiker.person)) {
      hiker.resolve();
    }
  });
};

const useEntrance = async (nodes, hikers, hiker, entrance) => {
  const hikersOfGroup = hikers.filter(otherHiker => hiker.group.includes(otherHiker.person));
  hikersOfGroup.forEach(hikerOfGroup => hikerOfGroup.action = 'waitForReturn');
  const newEntrance = await entrance.handlePersonGroup(hiker.group);
  const newVisit = hiker.visits.find(visit => visit.entrance === newEntrance);
  newVisit.lastSeen = Date.now();
  const newNode = nodes.find(node => node.entrance === newEntrance);
  hikersOfGroup.forEach(hikerOfGroup => {
    hikerOfGroup.person.position.copy(newNode.terrainInfo.point);
    hikerOfGroup.data = initNavigateData(newNode);
    hikerOfGroup.action = 'navigate'
  });
};

export default (terrain, nodes, hikers, hiker, elapsedTime) => {
  const hikerForWaitTo = getHikerForWaitTo(hiker.data.node, hikers, hiker.group);
  const navigator = findNavigator(hikers, hiker.group);
  if (navigator === hiker) {
    if (!hikerForWaitTo) {
      hiker.data.navigationTimeLeft -= elapsedTime;
      if (hiker.data.navigationTimeLeft > 0) {
        lookAtSignPost(hiker);
        return 'navigate';
      } else {
        const bestNextVisit = findBestNextVisit(hiker);
        if (bestNextVisit.entrance) {
          if (bestNextVisit.entrance.exit) {
            resolveGroup(hikers, hiker.group);
            return 'navigate';
          }
          useEntrance(nodes, hikers, hiker, bestNextVisit.entrance)
          return 'waitForReturn';
        }
        hiker.data = initWalkData(terrain, hiker, hiker.data.node, bestNextVisit.path);
        return 'walk';
      }
    } else {
      waitForOtherHiker(hiker, hikerForWaitTo);
      return 'navigate';
    }
  } else {
    if (navigator.action === 'walk' && navigator.data.endNode !== hiker.data.node) {
      hiker.data = initWalkData(terrain, hiker, hiker.data.node, navigator.data.path);
      return 'walk';
    } else {
      waitForOtherHiker(hiker, hikerForWaitTo || navigator);
      return 'navigate';
    }
  }
};