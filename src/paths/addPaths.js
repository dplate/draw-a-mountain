import drawPaths from "./drawPaths.js";
import buildPaths from "./buildPaths.js";
import createHikerHandler from "./createHikerHandler.js";

export default async (scene, menu, terrain, restaurant, cableCar, dispatcher) => {
  const nodes = await drawPaths(scene, menu, terrain, restaurant, cableCar, dispatcher);
  await buildPaths(scene, terrain, nodes);
  const hikerHandler = createHikerHandler(nodes);

  dispatcher.listen('paths', 'animate', ({elapsedTime}) => {
    hikerHandler.updateHikers(elapsedTime);
  });

  return {
    handlePersonGroup: hikerHandler.handlePersonGroup
  };
};