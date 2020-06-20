import fillTrain from './fillTrain.js';
import driveToStation from '../driveToStation.js';
import driveToEnd from '../driveToEnd.js';
import offBoarding from './offBoarding.js';
import onBoarding from './onBoarding.js';

export default (train, elapsedTime) => {
  switch (train.data.action) {
    case 'fillTrain':
      if (fillTrain(train, elapsedTime)) {
        train.positionX = -0.1;
        train.data.action = 'driveToStation';
      }
      break;
    case 'driveToStation' :
      if (driveToStation(train, elapsedTime)) {
        train.data.action = 'offBoarding';
      }
      break;
    case 'offBoarding' :
      if (offBoarding(train)) {
        train.data.action = 'onBoarding';
      }
      break;
    case 'onBoarding' :
      if (onBoarding(train)) {
        train.data.action = 'driveToEnd';
      }
      break;
    case 'driveToEnd':
      if (driveToEnd(train, elapsedTime)) {
        train.data.waitTimeLeft = 90000;
        train.data.action = 'fillTrain';
        train.speed = 0;
      }
      break;
  }
};