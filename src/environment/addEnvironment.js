import createSky from "./createSky.js";
import createClouds from "./createClouds.js";

export default (scene, dispatcher) => {
  createSky(scene);
  createClouds(scene, dispatcher);
};