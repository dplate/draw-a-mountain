import setupSky from "./setupSky.js";
import setupClouds from "./setupClouds.js";

export default (scene) => {
  setupSky(scene);
  setupClouds(scene);
};