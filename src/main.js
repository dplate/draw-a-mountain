import setup from "./setup.js";
import addTerrain from "./terrain/addTerrain.js";
import addEnvironment from "./environment/addEnvironment.js";
import addMenu from "./menu/addMenu.js";
import addRestaurant from "./restaurant/addRestaurant.js";
import addSmoke from "./particles/addSmoke.js";
import addCableCar from "./cableCar/addCableCar.js";
import addTrees from "./trees/addTrees.js";

const start = async () => {
  const {scene, camera, dispatcher} = setup(window);

  const menu = await addMenu(scene, camera, dispatcher);
  const smoke = await addSmoke(scene, dispatcher);
  addEnvironment(scene, dispatcher);
  const terrain = await addTerrain(scene, dispatcher);
  const trees = await addTrees(scene, dispatcher, menu, terrain);
  await addRestaurant(scene, menu, smoke, terrain, dispatcher);
  await addCableCar(scene, menu, smoke, terrain, trees, dispatcher);
}

start();