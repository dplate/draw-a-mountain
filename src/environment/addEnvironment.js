import createSky from "./createSky.js";
import createClouds from "./createClouds.js";

export default async (scene) => {
  createSky(scene);
  return await createClouds(scene);
};