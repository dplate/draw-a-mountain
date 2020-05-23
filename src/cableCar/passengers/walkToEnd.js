import walkToPoint from "./walkToPoint.js";

export default (passengerGroup, elapsedTime) => {
  let allAtEnd = true;
  passengerGroup.passengers.forEach((passenger) => {
    if (!walkToPoint(passenger.person, passenger.endPoint, elapsedTime)) {
      allAtEnd = false;
    }
  });
  return allAtEnd;
};

