import calculateSeatsTaken from './calculateSeatsTaken.js';
import {MIN_PERSON_Z} from '../../lib/constants.js';

const findOldPassenger = passengers =>
  passengers.find(passenger => passenger.action === 'drive' || passenger.action === 'walkToSeat');

const removeOldPassengers = (train) => {
  let oldPassenger = null;
  while (oldPassenger = findOldPassenger(train.data.passengers)) {
    train.data.passengers = train.data.passengers.filter(passenger => passenger.group !== oldPassenger.group);
    train.data.persons.removeGroup(oldPassenger.group);
  }
};

const createNewPassengers = (train) => {
  let seatIndex = 0;
  while (train.data.seats.length - calculateSeatsTaken(train) >= 3) {
    const group = train.data.persons.createGroup();
    const groupWaitX = 0.645 + Math.random() * 0.11;
    group.forEach(person => {
      const waitingPoint = new THREE.Vector3(
        groupWaitX - 0.01 + Math.random() % 0.02,
        0,
        MIN_PERSON_Z * (1 - person.scale) * 20
      );
      train.data.passengers.push({
        group,
        person,
        seat: train.data.seats[seatIndex],
        action: 'drive',
        waitingPoint,
        pathPoint: null
      });
      seatIndex++;
    });
  }
};

export default (train, elapsedTime) => {
  train.data.waitTimeLeft -= elapsedTime;
  if (train.data.waitTimeLeft <= 0) {
    removeOldPassengers(train);
    createNewPassengers(train);
    return true;
  }
  return false;
};