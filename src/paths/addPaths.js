import drawPaths from "./draw/drawPaths.js";
import buildPaths from "./build/buildPaths.js";
import createHikerHandler from "./hikers/createHikerHandler.js";
import reducePaths from "./reducePaths.js";

export default async (scene, menu, terrain, pois, dispatcher) => {
  const drawnNodes = await drawPaths(scene, menu, terrain, pois, dispatcher);
  await buildPaths(scene, terrain, drawnNodes);
  const nodes = reducePaths(drawnNodes);
  const hikerHandler = createHikerHandler(terrain, nodes);

  dispatcher.listen('paths', 'animate', ({elapsedTime}) => {
    hikerHandler.updateHikers(elapsedTime);
  });

  return {
    handlePersonGroup: hikerHandler.handlePersonGroup
  };
};