export default (train, elapsedTime) => {
  const distance = elapsedTime * train.speed;
  train.positionX += distance;

  train.cars.forEach((car, index) => car.updatePosition(train.positionX, train.speed, index, elapsedTime));
  train.wheels.rotateWheels(distance);
};