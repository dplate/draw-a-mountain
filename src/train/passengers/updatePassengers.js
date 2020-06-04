import walkToPoint from "../../lib/walkToPoint.js";
import findJitterTerrain from "../../lib/findJitterTerrain.js";

const trainOffsetY = 0.002;
const trainZ = 0.09;
const platformOffsetY = 0;
const platformZ = 0;

const endPoint = new THREE.Vector3();

let lastTrainPositionX = 0;

export default (train, elapsedTime) => {
  train.data.passengers.forEach(passenger => {
    const person = passenger.person;
    switch (passenger.action) {
      case 'drive':
        person.position.x = train.positionX + passenger.seat.seatOffsetX;
        person.position.y = trainOffsetY;
        person.position.z = trainZ;
        person.animation = 'standing';
        person.setDirection('front');
        break;
      case 'walkToExit':
        endPoint.x = train.positionX + passenger.seat.doorOffsetX;
        endPoint.y = trainOffsetY;
        endPoint.z = trainZ;
        if (walkToPoint(person, endPoint, elapsedTime)) {
          passenger.action = 'getOut';
        }
        break;
      case 'getOut':
        endPoint.x = train.positionX + passenger.seat.doorOffsetX;
        endPoint.y = platformOffsetY;
        endPoint.z = platformZ;
        if (walkToPoint(person, endPoint, elapsedTime)) {
          passenger.seat = null;
          passenger.pathPoint = findJitterTerrain(
            train.data.terrain, person.position, train.data.entrance.terrainInfo.point
          ).point;
          passenger.action = 'walkToPath';
        }
        person.setDirection('back');
        break;
      case 'walkToPath':
        if (walkToPoint(person, passenger.pathPoint, elapsedTime)) {
          passenger.action = 'waitForReturn';
          const groupPassengers = train.data.passengers.filter(otherPassenger =>
            otherPassenger.group === passenger.group && otherPassenger.action === 'waitForReturn'
          )
          if (groupPassengers.length === passenger.group.length) {
            train.data.paths.handlePersonGroup(passenger.group).then(() => {
              groupPassengers.forEach(groupPassenger => groupPassenger.action = 'walkToWaitingPoint');
            });
          }
        }
        break;
      case 'walkToWaitingPoint':
        endPoint.x = passenger.waitX;
        endPoint.y = platformOffsetY;
        endPoint.z = platformZ;
        if (walkToPoint(person, endPoint, elapsedTime)) {
          passenger.action = 'waitForTrain';
          person.setDirection('front');
        }
        break;
      case 'walkToTrain':
        endPoint.x = train.positionX + passenger.seat.doorOffsetX;
        endPoint.y = platformOffsetY;
        endPoint.z = platformZ;
        if (walkToPoint(person, endPoint, elapsedTime)) {
          passenger.action = 'getIn';
        }
        break;
      case 'getIn':
        endPoint.x = train.positionX + passenger.seat.doorOffsetX;
        endPoint.y = trainOffsetY;
        endPoint.z = trainZ;
        if (walkToPoint(person, endPoint, elapsedTime)) {
          passenger.action = 'walkToSeat';
        }
        person.setDirection('front');
        break;
      case 'walkToSeat':
        person.position.x += train.positionX - lastTrainPositionX;
        endPoint.x = train.positionX + passenger.seat.seatOffsetX;
        endPoint.y = trainOffsetY;
        endPoint.z = trainZ;
        if (walkToPoint(person, endPoint, elapsedTime)) {
          passenger.action = 'drive';
        }
        break;
    }
  });
  lastTrainPositionX = train.positionX;
};