export default (passengerGroup) => {
  const {requiredDirection, car, passengers} = passengerGroup;
  passengers.forEach(passenger => {
    passenger.person.position.addVectors(car.position, passenger.carOffset);
    passenger.person.setDirection('front');
  });
  if (car.userData.direction !== requiredDirection) {
    car.userData.usedCapacity -= passengers.length;
    return true;
  }
  return false;
}