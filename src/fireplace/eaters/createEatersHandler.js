import walkGroupToPoint from '../../lib/walkGroupToPoint.js';
import findJitterTerrain from '../../lib/findJitterTerrain.js';
import takeSeats from './takeSeats.js';
import eat from '../../restaurant/guests/eat.js';
import walkToPoint from '../../lib/walkToPoint.js';
import walkToSeat from './walkToSeat.js';

const createEndPoint = (terrain, entrance, navigationData) => {
  const terrainInfo = findJitterTerrain(terrain, navigationData.fireplacePoint, entrance.terrainInfo.point);
  return terrainInfo ? terrainInfo.point : entrance.terrainInfo.point;
};

const createEaterGroup = (terrain, entrance, navigationData, personGroup, resolve) => {
  const eaterGroup = {
    personGroup,
    eaters: personGroup.map(person => ({
      person,
      endPoint: createEndPoint(terrain, entrance, navigationData),
      seat: null,
      seatPoint: null,
      action: null,
      waitTimeLeft: null
    })),
    waitTimeLeft: null,
    action: 'walkToSeat',
    resolve
  };
  eaterGroup.navigator = eaterGroup.eaters.find(eater => eater.person.navigator);
  eaterGroup.others = eaterGroup.eaters.filter(eater => !eater.person.navigator);
  return eaterGroup;
}

export default (terrain, entrance, navigationData, fireData) => {
  let eaterGroups = [];

  return {
    handlePersonGroup: async (personGroup) => {
      await new Promise((resolve) => {
        const eaterGroup = createEaterGroup(terrain, entrance, navigationData, personGroup, resolve);
        if (!takeSeats(eaterGroup.eaters, navigationData.seats)) {
          eaterGroup.action = 'walkToEnd';
        } else if (fireData.status === 'burned') {
          eaterGroup.action = 'walkToFireplace';
          fireData.status = 'preparation';
        } else {
          fireData.status = 'stoking';
        }
        eaterGroups.push(eaterGroup);
      });
      eaterGroups = eaterGroups.filter(eaterGroup => eaterGroup.personGroup !== personGroup);
      return entrance;
    },
    updateEaters: (elapsedTime) => {
      eaterGroups.forEach(eaterGroup => {
        switch (eaterGroup.action) {
          case 'walkToFireplace':
            if (walkToPoint(eaterGroup.navigator.person, navigationData.fireplacePreparationPoint, elapsedTime)) {
              eaterGroup.navigator.person.setDirection('back');
              eaterGroup.waitTimeLeft = 5000;
              eaterGroup.action = 'prepareFire'
            } else {
              walkToSeat(eaterGroup.others, elapsedTime);
            }
            break;
          case 'prepareFire':
            eaterGroup.waitTimeLeft -= elapsedTime;
            if (eaterGroup.waitTimeLeft < 0) {
              fireData.status = 'stoking';
              eaterGroup.action = 'walkToSeat';
            } else {
              walkToSeat(eaterGroup.others, elapsedTime);
            }
            break;
          case 'walkToSeat':
            if (walkToSeat(eaterGroup.eaters, elapsedTime)) {
              eaterGroup.eaters.forEach(eater => eater.seat.showSausage());
              eaterGroup.waitTimeLeft = (1 + Math.random() * 2) * 60 * 1000;
              eaterGroup.action = 'fry';
            }
            break;
          case 'fry':
            eaterGroup.waitTimeLeft -= elapsedTime;
            if (eaterGroup.waitTimeLeft < 0) {
              eaterGroup.eaters.forEach(eater => {
                eater.seat.hideSausage();
                eater.person.animation = 'eating';
              });
              eaterGroup.waitTimeLeft = (1 + Math.random() * 2) * 60 * 1000;
              eaterGroup.action = 'eat';
              const fryingGroup = eaterGroups.find(otherGroup => {
                return otherGroup.action !== 'eat' && otherGroup.action !== 'walkToEnd'
              })
              if (!fryingGroup) {
                fireData.status = 'burningOut';
              }
            }
            break;
          case 'eat':
            eaterGroup.waitTimeLeft -= elapsedTime;
            if (eaterGroup.waitTimeLeft < 0) {
              eaterGroup.eaters.forEach(eater => eater.seat.taken = false);
              eaterGroup.action = 'walkToEnd';
            }
            break;
          case 'walkToEnd':
            if (walkGroupToPoint(eaterGroup.eaters, 'endPoint', elapsedTime)) {
              eaterGroup.resolve();
            }
            break;
        }
      });
    }
  };
};
