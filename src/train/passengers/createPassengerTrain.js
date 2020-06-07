import createSeats from './createSeats.js';
import updatePassengers from './updatePassengers.js';
import updatePassengerTrain from './updatePassengerTrain.js';

export default (train) => {
  return {
    init: (terrain, persons, paths, entrance, dispatcher) => {
      train.cars = [
        train.availableCars.locomotive,
        ...train.availableCars.coaches
      ];
      train.maxSpeed = 0.00004;
      train.data = {
        terrain,
        persons,
        paths,
        entrance,
        action: 'fillTrain',
        waitTimeLeft: 0,
        seats: createSeats(),
        passengers: []
      };
      dispatcher.listen('train', 'animate', ({elapsedTime}) => {
        updatePassengerTrain(train, elapsedTime);
        updatePassengers(train, elapsedTime);
      });
    },
    deinit: (dispatcher) => {
      dispatcher.stopListen('train', 'animate');
    }
  }
};