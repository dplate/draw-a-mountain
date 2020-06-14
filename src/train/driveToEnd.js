import moveTrain from './moveTrain.js';
import jumpToPosition from './jumpToPosition.js';

const ACCELERATION_SPEED = 3.5;

export default (train, elapsedTime) => {
  train.speed += train.maxSpeed * train.maxSpeed * ACCELERATION_SPEED * elapsedTime;
  train.speed = Math.min(train.speed, train.maxSpeed);
  moveTrain(train, elapsedTime);
  if (train.positionX > 1.2) {
    jumpToPosition(train, -0.1);
    return true;
  } else {
    return false;
  }
};