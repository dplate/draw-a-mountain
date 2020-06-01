import createSeats from "./createSeats.js";
import updatePassengers from "./updatePassengers.js";
import updateTrain from "./updateTrain.js";

export default (train) => {
  return {
    init: (terrain, persons, paths, entrance) => {
      train.cars = [
        train.availableCars.locomotive,
        train.availableCars.coach1,
        train.availableCars.coach2
      ];
      train.data = {
        terrain,
        persons,
        paths,
        entrance,
        action: 'fillTrain',
        waitTimeLeft: 0,
        seats: createSeats(),
        passengers: []
      }
    },
    update: (elapsedTime) => {
      updateTrain(train, elapsedTime);
      updatePassengers(train, elapsedTime);
    }
  }
};