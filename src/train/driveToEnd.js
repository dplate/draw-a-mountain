import moveTrain from "./moveTrain.js";

const ACCELERATION_SPEED = 0.000000006;

export default (train, elapsedTime) => {
  train.speed += ACCELERATION_SPEED * elapsedTime;
  train.speed = Math.min(train.speed, train.maxSpeed);
  moveTrain(train, elapsedTime);
  return train.positionX > 1.2;
};