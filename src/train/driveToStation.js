import moveTrain from './moveTrain.js';

const BREAK_POSITION_X = 0.6;
const BREAK_SPEED = 0.000000006;

export default (train, elapsedTime) => {
  if (train.positionX > BREAK_POSITION_X) {
    train.speed -= BREAK_SPEED * elapsedTime;
    train.speed = Math.max(0, train.speed);
  } else {
    train.speed = train.maxSpeed;
  }
  moveTrain(train, elapsedTime);
  return train.speed <= 0;
};