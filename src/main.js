import setup from "./setup.js";
import addTerrain from "./terrain/addTerrain.js";
import addEnvironment from "./environment/addEnvironment.js";
import addTrees from "./trees/addTrees.js";

const start = async () => {
  const {scene, dispatcher} = setup(window);

  addEnvironment(scene, dispatcher);
  const terrain = await addTerrain(scene, dispatcher);
  await addTrees(scene, dispatcher, terrain);
}

start();