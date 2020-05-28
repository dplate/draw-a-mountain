import walkGroupToPoint from "../../lib/walkGroupToPoint.js";
import findJitterTerrain from "../../lib/findJitterTerrain.js";
import walkToEnd from "./walkToEnd.js";

const createEndPoint = (terrain, entrance, navigationData) => {
  const terrainInfo = findJitterTerrain(terrain, navigationData.doorPoint, entrance.terrainInfo.point);
  return terrainInfo ? terrainInfo.point : entrance.terrainInfo.point;
}

export default () => {
  let guestGroups = [];

  return {
    handlePersonGroup: async (terrain, entrance, navigationData, personGroup) => {
      await new Promise((resolve) => {
        guestGroups.push({
          personGroup,
          guests: personGroup.map(person => ({
            person,
            endPoint: createEndPoint(terrain, entrance, navigationData)
          })),
          navigationData,
          action: 'walkToEntry',
          resolve
        });
      });
      guestGroups = guestGroups.filter(guestGroup => guestGroup.persons !== personGroup);
      return entrance;
    },
    updateGuests: (elapsedTime) => {
      guestGroups.forEach(guestGroup => {
        switch (guestGroup.action) {
          case 'walkToEntry':
            if (walkGroupToPoint(guestGroup.personGroup, guestGroup.navigationData.doorPoint, elapsedTime)) {
              guestGroup.action = 'walkToEnd'
            }
            break;
          case 'walkToEnd':
            if (walkToEnd(guestGroup, elapsedTime)) {
              guestGroup.resolve();
            }
            break;
        }
      });
    }
  };
};
