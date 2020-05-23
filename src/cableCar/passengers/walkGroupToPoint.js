import walkToPoint from "./walkToPoint.js";

export default (passengerGroup, endPoint, elapsedTime) => {
  let allAtEnd = true;
  passengerGroup.personGroup.forEach((person) => {
    if (!walkToPoint(person, endPoint, elapsedTime)) {
      allAtEnd = false;
    }
  });
  return allAtEnd;
};

