import setup from "./setup.js";
import addTerrain from "./terrain/addTerrain.js";
import addEnvironment from "./environment/addEnvironment.js";
import addMenu from "./menu/addMenu.js";
import addSmoke from "./particles/addSmoke.js";
import addPaths from "./paths/addPaths.js";
import addRestaurant from "./restaurant/addRestaurant.js";
import addCableCar from "./cableCar/addCableCar.js";
import addTrees from "./trees/addTrees.js";
import addPersons from "./persons/addPersons.js";
/*
import addPersons from "./persons/addPersons.js";
import findNearestTerrain from "./lib/findNearestTerrain.js";
*/
const start = async () => {
  const {scene, camera, dispatcher} = setup(window);

  const menu = await addMenu(scene, camera, dispatcher);
  const smoke = await addSmoke(scene, dispatcher);
  addEnvironment(scene, dispatcher);
  const terrain = await addTerrain(scene, dispatcher);
  const trees = await addTrees(scene, dispatcher, menu, terrain);
  const restaurant = await addRestaurant(scene, menu, smoke, terrain, dispatcher);
  const cableCar = await addCableCar(scene, menu, smoke, terrain, trees, dispatcher);
  const paths = await addPaths(scene, menu, terrain, restaurant, cableCar, dispatcher);
  /*
  const terrainInfo = findNearestTerrain(terrain, new THREE.Vector3(0.5, 0.1, 0));
  const paths = await addPaths(scene, menu, terrain, {entrances: []}, {entrances: [terrainInfo]}, dispatcher);*/
  await addPersons(scene, paths, dispatcher);
}

start();