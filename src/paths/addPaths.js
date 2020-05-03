import drawPaths from "./drawPaths.js";
import buildPaths from "./buildPaths.js";

export default async (scene, menu, terrain, restaurant, cableCar, dispatcher) => {
  const nodes = await drawPaths(scene, menu, terrain, restaurant, cableCar, dispatcher);
  await buildPaths(scene, terrain, nodes);
  return {};
};