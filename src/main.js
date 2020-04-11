import setup from "./setup.js";
import addTerrain from "./terrain/addTerrain.js";
import addEnvironment from "./environment/addEnvironment.js";

const start = () => {
  const {scene, dispatcher} = setup(window);

  addEnvironment(scene, dispatcher);
  addTerrain(scene, dispatcher);
}

start();