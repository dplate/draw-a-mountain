import driveToStation from '../driveToStation.js';
import driveToEnd from '../driveToEnd.js';

export default (train, elapsedTime) => {
  switch (train.data.action) {
    case 'driveToStation' :
      if (driveToStation(train, elapsedTime)) {
        train.data.action = 'waitForSignal';
        train.data.resolve();
        train.data.resolve = null;
      }
      break;
    case 'startProcess':
      train.data.startProgress.progress += elapsedTime * 0.001;
      if (train.data.startProgress.progress > 1) {
        train.data.startProgress.progress = 0;
        train.data.action = 'driveToEnd';
        train.data.ignoreNextTouchEnd = true;
        train.data.resolve();
        train.data.resolve = null;
      }
      break;
    case 'abortStartProcess':
      train.data.startProgress.progress -= elapsedTime * 0.001;
      if (train.data.startProgress.progress < 0) {
        train.data.startProgress.progress = 0;
        train.data.action = 'waitForStart';
      }
      break;
    case 'driveToEnd':
      if (driveToEnd(train, elapsedTime)) {
        train.data.action = 'waitForFreight';
        train.speed = 0;
        if (train.data.resolve) {
          train.data.resolve();
          train.data.resolve = null;
        }
      }
      break;
  }
};