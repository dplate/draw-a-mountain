import setup from "./setup.js";
import addTerrain from "./terrain/addTerrain.js";
import addEnvironment from "./environment/addEnvironment.js";
import addTrees from "./trees/addTrees.js";
import addMenu from "./menu/addMenu.js";

const start = async () => {
  const {scene, camera, dispatcher} = setup(window);

  const menu = await addMenu(scene, camera, dispatcher);
  addEnvironment(scene, dispatcher);
  const terrain = await addTerrain(scene, dispatcher);
  await addTrees(scene, dispatcher, menu, terrain);
}

start();