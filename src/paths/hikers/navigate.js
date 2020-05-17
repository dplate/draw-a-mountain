import initWalkData from "./initWalkData.js";
import getPersonDirection from "../../lib/getPersonDirection.js";

const signPostPosition = new THREE.Vector3();

const findNavigator = (hikers, group) => {
  return hikers.find(hiker => group.includes(hiker.person) && hiker.person.navigator);
};

const getHikerForWaitTo = (node, hikers, group) => {
  return hikers.find(hiker =>
    group.includes(hiker.person) && (hiker.action !== 'navigate' || hiker.data.node !== node)
  );
};

const findBestNextPath = (hiker) => {
  const possibleVisits = [];
  hiker.data.node.paths.forEach(path => {
    let visit = hiker.visits.find(visit => visit.path === path);
    if (!visit) {
      visit = {
        path,
        lastSeen: 0
      };
      hiker.visits.push(visit);
    }
    possibleVisits.push(visit)
  });
  const sortedPossibleVisits = possibleVisits.sort((visit1, visit2) => {
    return visit1.lastSeen - visit2.lastSeen;
  });
  const bestNextVisits = sortedPossibleVisits.filter(visit => visit.lastSeen === sortedPossibleVisits[0].lastSeen);
  const bestNextVisit = bestNextVisits[Math.floor(Math.random() * bestNextVisits.length)];
  bestNextVisit.lastSeen = Date.now();
  return bestNextVisit.path;
};

const waitForOtherHiker = (hiker, otherHiker) => {
  hiker.person.animation = 'waiting';
  hiker.person.direction = getPersonDirection(hiker.person.position, otherHiker.person.position);
};

const lookAtSignPost = (hiker) => {
  hiker.person.animation = 'waiting';
  signPostPosition.copy(hiker.data.node.terrainInfo.point);
  signPostPosition.z += 0.05;
  hiker.person.direction = getPersonDirection(hiker.person.position, signPostPosition);
};

export default (terrain, hikers, hiker, elapsedTime) => {
  const hikerForWaitTo = getHikerForWaitTo(hiker.data.node, hikers, hiker.group);
  const navigator = findNavigator(hikers, hiker.group);
  if (navigator === hiker) {
    if (!hikerForWaitTo) {
      hiker.data.navigationTimeLeft -= elapsedTime;
      if (hiker.data.navigationTimeLeft > 0) {
        lookAtSignPost(hiker);
        return 'navigate';
      } else {
        const bestNextPath = findBestNextPath(hiker);
        hiker.data = initWalkData(terrain, hiker, hiker.data.node, bestNextPath);
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