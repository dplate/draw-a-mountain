import walkToPoint from './walkToPoint.js';

export default (group, endPointName, elapsedTime) => {
  let allAtEnd = true;
  group.forEach((item) => {
    if (!walkToPoint(item.person, item[endPointName], elapsedTime)) {
      allAtEnd = false;
    }
  });
  return allAtEnd;
};

