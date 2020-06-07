export default (train, positionX) => {
  const distance = positionX - train.positionX;
  train.speed = 0;
  train.positionX += distance;
  train.cars.forEach((car, index) => car.updatePosition(train.positionX, train.speed, index, 0));
  train.wheels.rotateWheels(distance);
};