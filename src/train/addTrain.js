import createTrack from './createTrack.js';
import createLocomotive from './createLocomotive.js';
import createWheels from './createWheels.js';
import createCars from './createCars.js';
import createPassengerTrain from './passengers/createPassengerTrain.js';
import createFreightTrain from './freight/createFreightTrain.js';

export default async (scene, tip, smoke, dispatcher) => {
  await createTrack(scene);
  const wheels = await createWheels(scene);
  const locomotive = await createLocomotive(scene, smoke, wheels);
  const coaches = await createCars(scene, wheels, 'train/coach', 2);
  const freights = await createCars(scene, wheels, 'train/freight', 3);
  const availableCars = {locomotive, coaches, freights};

  const train = {
    availableCars,
    wheels,
    data: {},
    positionX: -0.1,
    speed: 0,
    maxSpeed: 0.00004,
    cars: []
  };
  const freightTrain = createFreightTrain(scene, tip, train);
  const passengerTrain = createPassengerTrain(train);

  const entrance = {
    terrainInfo: {
      point: new THREE.Vector3(0.7, 0, 0),
      normal: new THREE.Vector3(0, 1, 0),
      slope: 0,
      height: 0
    },
    type: 'train'
  };

  return {
    switchToFreightMode: async () => {
      passengerTrain.deinit(dispatcher);
      await freightTrain.init(dispatcher);

      return freightTrain;
    },
    switchToPassengerMode: async (terrain, persons, paths) => {
      await freightTrain.deinit(dispatcher);
      passengerTrain.init(terrain, persons, paths, entrance, dispatcher);
    },
    entrances: [entrance]
  };
};