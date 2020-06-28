import setup from './setup.js';
import addTerrain from './terrain/addTerrain.js';
import addEnvironment from './environment/addEnvironment.js';
import addSmoke from './particles/addSmoke.js';
import addPaths from './paths/addPaths.js';
import addRestaurant from './restaurant/addRestaurant.js';
import addCableCar from './cableCar/addCableCar.js';
import addTrees from './trees/addTrees.js';
import addPersons from './persons/addPersons.js';
import addTrain from './train/addTrain.js';
import addTip from './tip/addTip.js';
import addObserver from './observer/addObserver.js';
import addCross from './cross/addCross.js';
import addFireplace from './fireplace/addFireplace.js';

const start = async () => {
  const system = setup(window);

  const smoke = await addSmoke(system);
  const tip = await addTip(system);
  addEnvironment(system);

  const train = await addTrain(system, tip, smoke);
  const freightTrain = await train.switchToFreightMode();

  const terrain = await addTerrain(system, freightTrain, tip);
  const trees = await addTrees(system, freightTrain, tip, terrain);
  const cross = await addCross(system, freightTrain, tip, terrain);
  const cableCar = await addCableCar(system, freightTrain, tip, smoke, terrain, trees);
  const restaurant = await addRestaurant(system, freightTrain, tip, smoke, terrain);
  const fireplace = await addFireplace(system, freightTrain, tip, terrain);
  const paths = await addPaths(system, freightTrain, tip, terrain, [train, cross, cableCar, restaurant, fireplace]);

  const persons = await addPersons(system);
  await train.switchToPassengerMode(terrain, persons, paths);

  await addObserver(system, persons);
}

start();