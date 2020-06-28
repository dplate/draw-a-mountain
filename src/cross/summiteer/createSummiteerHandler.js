import walkGroupToPoint from '../../lib/walkGroupToPoint.js';
import findJitterTerrain from '../../lib/findJitterTerrain.js';
import findNearestTerrain from '../../lib/findNearestTerrain.js';
import lookPanorama from './lookPanorama.js';
import takeSeats from './takeSeats.js';
import {MIN_Z} from '../../lib/constants.js';

const createGroupViewPoint = (terrain, crossPoint) => {
  const testPoint = crossPoint.clone();
  testPoint.x = testPoint.x + (0.01 + Math.random() * 0.01) * (Math.random() < 0.5 ? -1 : 1);
  testPoint.y = testPoint.y - 0.01 + Math.random() * 0.02;
  return findNearestTerrain(terrain, testPoint).point;
};

const createPersonViewPoint = (terrain, groupViewPoint) => {
  const testPoint = groupViewPoint.clone();
  testPoint.x = testPoint.x - 0.004 + Math.random() * 0.008;
  testPoint.y = testPoint.y - 0.004 + Math.random() * 0.008;
  return findNearestTerrain(terrain, testPoint).point;
};

const createEndPoint = (terrain, entrance, navigationData) => {
  const terrainInfo = findJitterTerrain(terrain, navigationData.crossPoint, entrance.terrainInfo.point);
  return terrainInfo ? terrainInfo.point : entrance.terrainInfo.point;
};

export default () => {
  let summiteerGroups = [];

  return {
    handlePersonGroup: async (terrain, entrance, navigationData, personGroup) => {
      await new Promise((resolve) => {
        const groupViewPoint = createGroupViewPoint(terrain, navigationData.crossPoint);
        const summiteerGroup = {
          personGroup,
          summiteers: personGroup.map(person => ({
            person,
            viewPoint: createPersonViewPoint(terrain, groupViewPoint),
            endPoint: createEndPoint(terrain, entrance, navigationData),
            seat: null,
            seatPoint: null,
            action: null,
            waitTimeLeft: null
          })),
          navigationData,
          waitTimeLeft: null,
          action: 'walkToView',
          resolve
        };

        summiteerGroups.push(summiteerGroup);
      });
      summiteerGroups = summiteerGroups.filter(summiteerGroup => summiteerGroup.personGroup !== personGroup);
      return entrance;
    },
    updateSummiteers: (elapsedTime) => {
      summiteerGroups.forEach(summiteerGroup => {
        switch (summiteerGroup.action) {
          case 'walkToView':
            if (walkGroupToPoint(summiteerGroup.summiteers, 'viewPoint', elapsedTime)) {
              summiteerGroup.action = 'lookPanorama';
            }
            break;
          case 'lookPanorama':
            if (lookPanorama(summiteerGroup.summiteers, elapsedTime)) {
              const foundSeats = takeSeats(summiteerGroup.summiteers, summiteerGroup.navigationData.seats);
              summiteerGroup.action = foundSeats ? 'walkToSeat' : 'walkToEnd';
            }
            break;
          case 'walkToSeat':
            if (walkGroupToPoint(summiteerGroup.summiteers, 'seatPoint', elapsedTime)) {
              summiteerGroup.summiteers.forEach(summiteer => {
                summiteer.person.setDirection(summiteer.seat.direction);
                summiteer.person.animation = Math.random() < 0.5 ? 'sitting' : 'eating';
                summiteer.person.position.y -= (0.002 - (1.0 - summiteer.person.scale) * 0.005);
                summiteer.person.position.z += MIN_Z;
              });
              summiteerGroup.waitTimeLeft = (2 + Math.random() * 5) * 60 * 1000;
              summiteerGroup.action = 'eat';
            }
            break;
          case 'eat':
            summiteerGroup.waitTimeLeft -= elapsedTime;
            if (summiteerGroup.waitTimeLeft < 0) {
              summiteerGroup.summiteers.forEach(summiteer => summiteer.seat.taken = false);
              summiteerGroup.action = 'walkToEnd';
            }
            break;
          case 'walkToEnd':
            if (walkGroupToPoint(summiteerGroup.summiteers, 'endPoint', elapsedTime)) {
              summiteerGroup.resolve();
            }
            break;
        }
      });
    }
  };
};
