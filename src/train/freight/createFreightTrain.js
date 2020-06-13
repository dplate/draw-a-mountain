import updateFreightTrain from './updateFreightTrain.js';
import handleTouchEvent from './handleTouchEvent.js';
import createStartProgress from './createStartProgress.js';
import loadAvailableCargos from './loadAvailableCargos.js';
import removeMesh from '../../lib/removeMesh.js';

const setTip = (tip, train) => {
  const path = new THREE.Path();
  path.moveTo(train.positionX + 0.03, 0);
  path.lineTo(train.positionX + 0.035, 0);
  tip.setTip(path, 2000);
}

export default (scene, tip, train) => {
  const freightTrain = {
    init: async (dispatcher) => {
      train.maxSpeed = 0.0001;
      train.data = {
        action: 'waitForFreight',
        resolve: null,
        startProgress: createStartProgress(scene),
        ignoreNextTouchEnd: false,
        availableCargos: await loadAvailableCargos(scene)
      };
      ['touchStart', 'touchMove', 'touchEnd'].forEach(eventName => {
        dispatcher.listen('train', eventName, ({point}) => {
          handleTouchEvent(train, eventName, point);
        });
      });
      dispatcher.listen('train', 'animate', ({elapsedTime}) => {
        updateFreightTrain(tip, train, elapsedTime);
        train.data.startProgress.update();
      });
    },
    waitForEnd: async () => {
      if (train.data.action !== 'waitForFreight') {
        await new Promise(resolve => {
          train.data.resolve = resolve;
        });
      }
    },
    deinit: async (dispatcher) => {
      await freightTrain.waitForEnd();
      dispatcher.stopListen('train', 'touchStart');
      dispatcher.stopListen('train', 'touchMove');
      dispatcher.stopListen('train', 'touchEnd');
      dispatcher.stopListen('train', 'animate');
      train.data.startProgress.remove();
      Object.values(train.data.availableCargos).forEach(cargo => removeMesh(scene, cargo));
    },
    deliver: async (cargos) => {
      await freightTrain.waitForEnd();
      return new Promise(resolve => {
        train.cars = [
          train.availableCars.locomotive,
          ...train.availableCars.freights.slice(0, cargos.length)
        ];
        train.positionX = -0.1;
        train.data.cargos = cargos.map(cargo => train.data.availableCargos[cargo]);
        train.data.cargos.forEach(cargo => cargo.visible = true);
        train.data.action = 'driveToStation';
        train.data.resolve = resolve;
      });
    },
    giveSignal: () => {
      return new Promise(resolve => {
        setTip(tip, train);
        train.data.action = 'waitForStart';
        train.data.resolve = resolve;
      });
    },
    revokeSignal: () => {
      tip.setTip(null);
      train.data.action = 'waitForSignal';
      train.data.resolve = null;
    },
    isWaitingForStart: () =>
      train.data.action === 'waitForStart' ||
      train.data.action === 'startProcess' ||
      train.data.action === 'abortStartProcess',
    isStarting: () =>
      train.data.action === 'startProcess' ||
      train.data.action === 'abortStartProcess'
  };
  return freightTrain;
};