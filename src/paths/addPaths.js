import drawPaths from "./drawPaths.js";

export default async (scene, menu, terrain, restaurant, cableCar, dispatcher) => {
  const nodes = await drawPaths(scene, menu, terrain, restaurant, cableCar, dispatcher);
  return {nodes};
};