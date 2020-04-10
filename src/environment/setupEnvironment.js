import setupSky from "./setupSky.js";
import setupClouds from "./setupClouds.js";

export default async (scene) => {
  setupSky(scene);
  return await setupClouds(scene);
};