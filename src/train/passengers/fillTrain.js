import calculateSeatsTaken from "./calculateSeatsTaken.js";

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
      train.data.passengers.push({
        group,
        person,
        seat: train.data.seats[seatIndex],
        action: 'drive',
        waitX: groupWaitX - 0.02 + Math.random() % 0.04,
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