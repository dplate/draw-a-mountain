import jumpToPosition from '../jumpToPosition.js';
import updateCargoPositions from './updateCargoPositions.js';

const isPointOnLocomotive = (train, point) => {
  return (
    point &&
    point.x > train.positionX &&
    point.x < train.positionX + 0.1 &&
    point.y < 0.075
  );
};

export default (train, eventName, point) => {
  switch (train.data.action) {
    case 'driveToStation':
      if (eventName === 'tap') {
        jumpToPosition(train, 0.75);
        updateCargoPositions(train);
        train.data.action = 'waitForSignal';
        train.data.resolve();
        train.data.resolve = null;
      }
      break;
    case 'waitForStart':
    case 'abortStartProcess':
      if (isPointOnLocomotive(train, point) && eventName === 'touchStart') {
        train.data.action = 'startProcess';
      }
      break;
    case 'startProcess':
      if (!isPointOnLocomotive(train, point) || eventName === 'touchEnd') {
        train.data.action = 'abortStartProcess';
      }
      break;
    case 'driveToEnd':
      if (eventName === 'tap') {
        if (train.data.ignoreNextTouchEnd) {
          train.data.ignoreNextTouchEnd = false;
        } else {
          jumpToPosition(train, -0.1);
          train.data.action = 'waitForFreight';
          train.speed = 0;
          if (train.data.resolve) {
            train.data.resolve();
            train.data.resolve = null;
          }
        }
      }
      break;
  }
};