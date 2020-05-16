import getPersonDirection from "../lib/getPersonDirection.js";

const initWalkPathData = (startNode, path) => {
  return {
    steps: path.nodes[0] === startNode ? path.steps : [...path.steps].reverse(),
    progress: 0,
    endNode: path.nodes.find(node => node !== startNode)
  };
};

const walkPath = (hiker, elapsedTime) => {
  hiker.data.progress += elapsedTime * 0.001;
  const lastStep = hiker.data.steps[Math.floor(hiker.data.progress)];
  const nextStep = hiker.data.steps[Math.floor(hiker.data.progress) + 1];
  if (nextStep) {
    hiker.person.animation = 'walking';
    hiker.person.position.lerpVectors(lastStep.point, nextStep.point, hiker.data.progress % 1);
    hiker.person.direction = getPersonDirection(hiker.person.position, nextStep.point);
    return walkPath;
  } else {
    if (hiker.data.endNode.exit) {
      hiker.resolve();
    }
    hiker.data = initChoosePathData(hiker.data.endNode);
    return choosePath;
  }
};

const initChoosePathData = (node) => ({
  node,
  timeLeft: node.paths.length > 2 ? 5000 : 0
});

const choosePath = (hiker, elapsedTime) => {
  hiker.data.timeLeft -= elapsedTime;
  if (hiker.data.timeLeft > 0) {
    hiker.person.animation = 'waiting';
    hiker.person.position.copy(hiker.data.node.terrainInfo.point);
    return choosePath;
  } else {
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

    hiker.data = initWalkPathData(hiker.data.node, bestNextVisit.path);
    return walkPath;
  }
}

export default (nodes) => {
  let hikers = [];

  return {
    handlePersonGroup: async (group) => {
      await Promise.all(
        group.map((person) => new Promise((resolve) => {
          hikers.push({
            visits: [],
            person,
            group,
            currentHandler: choosePath,
            data: initChoosePathData(nodes[0]),
            resolve
          });
        }))
      );
      hikers = hikers.filter(hiker => hiker.group !== group);
      return group;
    },
    updateHikers: (elapsedTime) => {
      hikers.forEach(hiker => {
        hiker.currentHandler = hiker.currentHandler(hiker, elapsedTime)
      });
    }
  };
};
