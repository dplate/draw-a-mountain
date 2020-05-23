import initNavigateData from "./initNavigateData.js";
import navigate from "./navigate.js";
import walk from "./walk.js";
import createVisits from "./createVisits.js";

export default (terrain, nodes) => {
  let hikers = [];

  return {
    handlePersonGroup: async (group) => {
      await Promise.all(
        group.map((person) => new Promise((resolve) => {
          hikers.push({
            visits: createVisits(group, nodes),
            person,
            group,
            action: 'navigate',
            data: initNavigateData(nodes[0]),
            resolve
          });
        }))
      );
      hikers = hikers.filter(hiker => hiker.group !== group);
      return group;
    },
    updateHikers: (elapsedTime) => {
      hikers.forEach(hiker => {
        switch (hiker.action) {
          case 'navigate':
            hiker.action = navigate(terrain, nodes, hikers, hiker, elapsedTime)
            break;
          case 'walk':
            hiker.action = walk(terrain, hikers, hiker, elapsedTime)
            break;
          case 'waitForReturn':
            break;
        }
      });
    }
  };
};
