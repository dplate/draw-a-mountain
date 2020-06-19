import drawPaths from './draw/drawPaths.js';
import buildPaths from './build/buildPaths.js';
import createHikerHandler from './hikers/createHikerHandler.js';
import reducePaths from './reducePaths.js';

export default async (system, freightTrain, tip, terrain, pois) => {
  await freightTrain.deliver(['dirt', 'sign']);
  const drawnNodes = await drawPaths(system, freightTrain, tip, terrain, pois);
  await buildPaths(system.scene, terrain, drawnNodes);
  const nodes = reducePaths(drawnNodes);
  const hikerHandler = createHikerHandler(terrain, nodes);

  system.dispatcher.listen('paths', 'animate', ({elapsedTime}) => {
    hikerHandler.updateHikers(elapsedTime);
  });

  return {
    handlePersonGroup: hikerHandler.handlePersonGroup
  };
};