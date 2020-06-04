const isCarInStation = (car, requiredDirection) => {
  return car.userData.direction === requiredDirection && car.userData.waitTimeLeft > 0;
};

const isEnoughCapacityLeft = (car, personGroup) => {
  return (car.userData.maxCapacity - car.userData.usedCapacity) >= personGroup.length;
}

export default (passengerGroup) => {
  const {requiredDirection, car, personGroup} = passengerGroup;
  if (isCarInStation(car, requiredDirection) && isEnoughCapacityLeft(car, personGroup)) {
    car.userData.usedCapacity += personGroup.length;
    car.userData.waitTimeLeft = 8000;
    return true;
  } else {
    return false;
  }
}