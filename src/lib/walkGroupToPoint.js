import walkToPoint from "./walkToPoint.js";

export default (group, endPoint, elapsedTime) => {
  let allAtEnd = true;
  group.forEach((person) => {
    if (!walkToPoint(person, endPoint, elapsedTime)) {
      allAtEnd = false;
    }
  });
  return allAtEnd;
};

