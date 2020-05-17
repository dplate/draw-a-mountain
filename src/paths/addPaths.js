import drawPaths from "./drawPaths.js";
import buildPaths from "./buildPaths.js";
import createHikerHandler from "./hikers/createHikerHandler.js";

export default async (scene, menu, terrain, restaurant, cableCar, dispatcher) => {
  const nodes = await drawPaths(scene, menu, terrain, restaurant, cableCar, dispatcher);
  await buildPaths(scene, terrain, nodes);
  const hikerHandler = createHikerHandler(terrain, nodes);

  dispatcher.listen('paths', 'animate', ({elapsedTime}) => {
    hikerHandler.updateHikers(elapsedTime);
  });

  return {
    handlePersonGroup: hikerHandler.handlePersonGroup
  };
};