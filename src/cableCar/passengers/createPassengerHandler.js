import waitForCar from './waitForCar.js';
import walkIntoCar from './walkIntoCar.js';
import driveCar from './driveCar.js';
import findJitterTerrain from '../../lib/findJitterTerrain.js';
import walkGroupToPoint from '../../lib/walkGroupToPoint.js';
import {MIN_PERSON_Z} from '../../lib/constants.js';

const createQueuePoint = (station) => {
  const point = new THREE.Vector3();
  point.copy(station.position);
  point.y -= station.scale.y * 0.83;
  point.z -= MIN_PERSON_Z;
  return point;
}

const createDoorPoint = (entrance, station) => {
  const point = new THREE.Vector3();
  point.copy(station.position);
  point.x -= station.scale.x * (0.5 + Math.random() * 0.1);
  point.y -= station.scale.y * 0.85;
  point.z -= MIN_PERSON_Z;
  return point;
}

const createEndPoint = (terrain, entrance, station) => {
  const terrainInfo = findJitterTerrain(terrain, station.position, entrance.terrainInfo.point);
  return terrainInfo ? terrainInfo.point : entrance.terrainInfo.point;
}

export default () => {
  let passengerGroups = [];

  return {
    handlePersonGroup: async (terrain, startStation, startEntrance, endStation, endEntrance, car, requiredDirection, personGroup) => {
      await new Promise((resolve) => {
        passengerGroups.push({
          personGroup,
          passengers: personGroup.map(person => ({
            person,
            carOffset: null,
            entryPoint: createDoorPoint(startEntrance, startStation),
            exitPoint: createDoorPoint(endEntrance, endStation),
            queuePoint: createQueuePoint(startStation),
            endPoint: createEndPoint(terrain, endEntrance, endStation)
          })),
          startEntrance,
          endEntrance,
          car,
          requiredDirection,
          action: 'walkToEntry',
          resolve
        });
      });
      passengerGroups = passengerGroups.filter(passengerGroup => passengerGroup.personGroup !== personGroup);
      return endEntrance;
    },
    updatePassengers: (elapsedTime) => {
      passengerGroups.forEach(passengerGroup => {
        switch (passengerGroup.action) {
          case 'walkToEntry':
            if (walkGroupToPoint(passengerGroup.passengers, 'entryPoint', elapsedTime)) {
              passengerGroup.action = 'walkToQueue'
            }
            break;
          case 'walkToQueue':
            if (walkGroupToPoint(passengerGroup.passengers, 'queuePoint', elapsedTime)) {
              passengerGroup.action = 'waitForCar'
            }
            break;
          case 'waitForCar':
            if (waitForCar(passengerGroup)) {
              passengerGroup.action = 'walkIntoCar'
            }
            break;
          case 'walkIntoCar':
            if (walkIntoCar(passengerGroup, elapsedTime)) {
              passengerGroup.action = 'driveCar'
            }
            break;
          case 'driveCar':
            if (driveCar(passengerGroup)) {
              passengerGroup.action = 'walkToExit'
            }
            break;
          case 'walkToExit':
            if (walkGroupToPoint(passengerGroup.passengers, 'exitPoint', elapsedTime)) {
              passengerGroup.action = 'walkToEnd'
            }
            break;
          case 'walkToEnd':
            if (walkGroupToPoint(passengerGroup.passengers, 'endPoint', elapsedTime)) {
              passengerGroup.resolve();
            }
            break;
        }
      });
    }
  };
};
