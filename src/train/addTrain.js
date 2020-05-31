import createTrack from "./createTrack.js";
import createLocomotive from "./createLocomotive.js";
import createWheels from "./createWheels.js";
import createCoach from "./createCoach.js";

const STATION_POSITION_X = 0.74;
const BREAK_DISTANCE = 0.15;
const BREAK_SPEED = 0.0000001;
const MAX_SPEED = 0.00004;

const moveTrain = (train, wheels, elapsedTime) => {
  const distance = elapsedTime * train.speed;
  train.positionX += distance;

  train.cars.forEach((car, index) => car.updatePosition(train.positionX, train.speed, index));
  wheels.rotateWheels(distance);
};

export default async (scene, smoke, dispatcher) => {
  await createTrack(scene);
  const wheels = await createWheels();
  const locomotive = await createLocomotive(scene, smoke, wheels);
  const coach1 = await createCoach(scene, wheels);
  const coach2 = await createCoach(scene, wheels);

  const train = {
    mode: 'passenger',
    action: 'driveToStation',
    positionX: -0.1,
    waitTimeLeft: 0,
    speed: MAX_SPEED,
    cars: [locomotive, coach1, coach2]
  };

  dispatcher.listen('train', 'animate', ({elapsedTime}) => {
    if (train.mode === 'passenger') {
      switch (train.action) {
        case 'driveToStation':
          if (train.positionX > STATION_POSITION_X - BREAK_DISTANCE) {
            train.speed -= BREAK_SPEED;
            train.speed = Math.max(0, train.speed);
          }
          moveTrain(train, wheels, elapsedTime);
          if (train.speed <= 0) {
            train.waitTimeLeft = 5000;
            train.action = 'waitForBoarding';
          }
          break;
        case 'waitForBoarding':
          train.waitTimeLeft -= elapsedTime;
          if (train.waitTimeLeft < 0) {
            train.action = 'driveToEnd';
          }
          break;
        case 'driveToEnd':
          if (train.speed < MAX_SPEED) {
            train.speed += BREAK_SPEED;
          }
          moveTrain(train, wheels, elapsedTime);
          if (train.positionX > 1.1) {
            train.speed = MAX_SPEED;
            train.positionX = -0.1;
            train.action = 'driveToStation';
          }
          break;
      }
    }
  });

  return {
    entrances: [{
      terrainInfo: {
        point: new THREE.Vector3(0.7, 0, 0),
        normal: new THREE.Vector3(0, 1, 0),
        slope: 0,
        height: 0
      },
      exit: true
    }]
  };
};