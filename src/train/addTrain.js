import createTrack from './createTrack.js';
import createLocomotive from './createLocomotive.js';
import createWheels from './createWheels.js';
import createCoach from './createCoach.js';
import createPassengerHandler from './passengers/createPassengerHandler.js';

export default async (scene, smoke, dispatcher) => {
  await createTrack(scene);
  const wheels = await createWheels(scene);
  const locomotive = await createLocomotive(scene, smoke, wheels);
  const coach1 = await createCoach(scene, wheels);
  const coach2 = await createCoach(scene, wheels);
  const availableCars = {locomotive, coach1, coach2};

  const train = {
    availableCars,
    wheels,
    data: {},
    positionX: -0.1,
    speed: 0,
    maxSpeed: 0.00004,
    cars: [],
    update: null
  };
  const passengerHandler = createPassengerHandler(train);

  dispatcher.listen('train', 'animate', ({elapsedTime}) => {
    if (train.update !== null) {
      train.update(elapsedTime);
    }
  });

  const entrance = {
    terrainInfo: {
      point: new THREE.Vector3(0.7, 0, 0),
      normal: new THREE.Vector3(0, 1, 0),
      slope: 0,
      height: 0
    },
    exit: true
  };

  return {
    switchToPassengerMode: (terrain, persons, paths) => {
      passengerHandler.init(terrain, persons, paths, entrance);
      train.update = passengerHandler.update;
    },
    entrances: [entrance]
  };
};