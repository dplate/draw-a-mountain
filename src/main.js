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

const start = async () => {
  const {scene, dispatcher} = setup(window);

  const smoke = await addSmoke(scene, dispatcher);
  const tip = await addTip(scene, dispatcher);
  addEnvironment(scene, dispatcher);

  const train = await addTrain(scene, tip, smoke, dispatcher);
  const freightTrain = train.switchToFreightMode();

  const terrain = await addTerrain(scene, freightTrain, tip, dispatcher);
  const trees = await addTrees(scene, freightTrain, tip, terrain, dispatcher);
  const restaurant = await addRestaurant(scene, freightTrain, tip, smoke, terrain, dispatcher);
  const cableCar = await addCableCar(scene, freightTrain, tip, smoke, terrain, trees, dispatcher);
  const paths = await addPaths(scene, freightTrain, terrain, [train, restaurant, cableCar], dispatcher);

  const persons = await addPersons(scene, dispatcher);
  train.switchToPassengerMode(terrain, persons, paths);
}

start();