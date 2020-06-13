import driveToStation from '../driveToStation.js';
import driveToEnd from '../driveToEnd.js';
import updateCargoPositions from './updateCargoPositions.js';
import setOpacity from '../../lib/setOpacity.js';

export default (tip, train, elapsedTime) => {
  switch (train.data.action) {
    case 'driveToStation' :
      if (driveToStation(train, elapsedTime)) {
        train.data.action = 'waitForSignal';
        train.data.resolve();
        train.data.resolve = null;
      } else {
        updateCargoPositions(train);
      }
      break;
    case 'startProcess':
      train.data.startProgress.progress += elapsedTime * 0.001;
      if (train.data.startProgress.progress > 1) {
        tip.setTip(null);
        train.data.startProgress.progress = 0;
        train.data.action = 'driveToEnd';
        train.data.cargos.forEach(cargo => {
          setOpacity(cargo, 1);
          cargo.visible = false
        });
        train.data.ignoreNextTouchEnd = true;
        train.data.resolve();
        train.data.resolve = null;
      } else {
        train.data.cargos.forEach(cargo => setOpacity(cargo, 1 - train.data.startProgress.progress));
      }
      break;
    case 'abortStartProcess':
      train.data.startProgress.progress -= elapsedTime * 0.001;
      if (train.data.startProgress.progress < 0) {
        train.data.startProgress.progress = 0;
        train.data.action = 'waitForStart';
      } else {
        train.data.cargos.forEach(cargo => setOpacity(cargo, 1 - train.data.startProgress.progress));
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