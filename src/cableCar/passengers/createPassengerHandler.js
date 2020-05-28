import waitForCar from "./waitForCar.js";
import walkIntoCar from "./walkIntoCar.js";
import driveCar from "./driveCar.js";
import findJitterTerrain from "../../lib/findJitterTerrain.js";
import walkToEnd from "./walkToEnd.js";
import walkGroupToPoint from "../../lib/walkGroupToPoint.js";

const createQueuePoint = (station) => {
  const point = new THREE.Vector3();
  point.copy(station.position);
  point.y -= station.scale.y * 0.83;
  point.z -= 0.001;
  return point;
}

const createDoorPoint = (entrance, station) => {
  const point = new THREE.Vector3();
  point.copy(station.position);
  point.x -= station.scale.x * 0.5;
  point.y -= station.scale.y * 0.85;
  point.z -= 0.001;
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
            endPoint: createEndPoint(terrain, endEntrance, endStation)
          })),
          startEntrance,
          endEntrance,
          car,
          requiredDirection,
          entryPoint: createDoorPoint(startEntrance, startStation),
          queuePoint: createQueuePoint(startStation),
          exitPoint: createDoorPoint(endEntrance, endStation),
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
            if (walkGroupToPoint(passengerGroup.personGroup, passengerGroup.entryPoint, elapsedTime)) {
              passengerGroup.action = 'walkToQueue'
            }
            break;
          case 'walkToQueue':
            if (walkGroupToPoint(passengerGroup.personGroup, passengerGroup.queuePoint, elapsedTime)) {
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
            if (walkGroupToPoint(passengerGroup.personGroup, passengerGroup.exitPoint, elapsedTime)) {
              passengerGroup.action = 'walkToEnd'
            }
            break;
          case 'walkToEnd':
            if (walkToEnd(passengerGroup, elapsedTime)) {
              passengerGroup.resolve();
            }
            break;
        }
      });
    }
  };
};
