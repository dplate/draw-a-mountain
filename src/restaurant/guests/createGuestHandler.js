import walkGroupToPoint from "../../lib/walkGroupToPoint.js";
import findJitterTerrain from "../../lib/findJitterTerrain.js";
import walkToEnd from "./walkToEnd.js";
import findTable from "./findTable.js";
import walkToChair from "./walkToChair.js";
import eat from "./eat.js";

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
            chair: null,
            endPoint: createEndPoint(terrain, entrance, navigationData)
          })),
          navigationData,
          waitTimeLeft: null,
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
              guestGroup.waitTimeLeft = 1000;
              guestGroup.action = 'findTable';
            }
            break;
          case 'findTable':
            if (findTable(guestGroup, elapsedTime)) {
              if (guestGroup.guests[0].chair === null) {
                guestGroup.action = 'walkToEnd';
              } else {
                guestGroup.action = 'walkToChair';
              }
            }
            break;
          case 'walkToChair':
            if (walkToChair(guestGroup, elapsedTime)) {
              guestGroup.waitTimeLeft = 200000;
              guestGroup.action = 'eat';
            }
            break;
          case 'eat':
            if (eat(guestGroup, elapsedTime)) {
              guestGroup.action = 'walkToExit';
            }
            break;
          case 'walkToExit':
            if (walkGroupToPoint(guestGroup.personGroup, guestGroup.navigationData.doorPoint, elapsedTime)) {
              guestGroup.action = 'walkToEnd';
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
