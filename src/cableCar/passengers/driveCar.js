export default (passengerGroup) => {
  const {requiredDirection, car, passengers} = passengerGroup;
  passengers.forEach(passenger => {
    passenger.person.position.addVectors(car.position, passenger.carOffset);
  });
  if (car.userData.direction !== requiredDirection) {
    car.userData.usedCapacity = 0;
    return true;
  }
  return false;
}