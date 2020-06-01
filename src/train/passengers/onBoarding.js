import calculateSeatsTaken from "./calculateSeatsTaken.js";

export default (train) => {
  let allOnBoard = true;
  train.data.passengers.forEach(passenger => {
    switch (passenger.action) {
      case 'walkToWaitingPoint':
      case 'waitForTrain':
        const groupPassengers = train.data.passengers.filter(otherPassenger =>
          otherPassenger.group === passenger.group &&
          (otherPassenger.action === 'walkToWaitingPoint' || otherPassenger.action === 'waitForTrain')
        );
        if (groupPassengers.length === passenger.group.length) {
          const seatsTaken = calculateSeatsTaken(train);
          if (train.data.seats.length - seatsTaken >= groupPassengers.length) {
            groupPassengers.forEach((groupPassenger, personIndex) => {
              groupPassenger.action = 'walkToTrain';
              groupPassenger.seat = train.data.seats[seatsTaken + personIndex];
            });
            allOnBoard = false;
          }
        }
        break;
      case 'walkToTrain':
      case 'getIn':
        allOnBoard = false;
        break;
    }
  });
  return allOnBoard;
}