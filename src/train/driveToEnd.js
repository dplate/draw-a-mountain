import moveTrain from './moveTrain.js';

const ACCELERATION_SPEED = 3.5;

export default (train, elapsedTime) => {
  train.speed += train.maxSpeed * train.maxSpeed * ACCELERATION_SPEED * elapsedTime;
  train.speed = Math.min(train.speed, train.maxSpeed);
  moveTrain(train, elapsedTime);
  return train.positionX > 1.2;
};