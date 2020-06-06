import findJitterTerrain from '../../lib/findJitterTerrain.js';
import isNavigationNeeded from './isNavigationNeeded.js';

const isSlowestHiker = (hiker) => !hiker.group.find(otherPerson => otherPerson.baseSpeed < hiker.person.baseSpeed);

export default (terrain, hiker, startNode, path) => {
  const endNode = path.nodes.find(node => node !== startNode);
  const steps = [...path.steps];
  if (path.nodes[0] !== startNode) {
    steps.reverse();
  }
  if (hiker.person.position.x !== 0) {
    steps[0] = {
      ...steps[0],
      point: hiker.person.position.clone()
    };
  }
  const navigationNeeded = isNavigationNeeded(endNode);
  const waitingNeeded = hiker.group.length > 1 && !isSlowestHiker(hiker);
  if (navigationNeeded || waitingNeeded) {
    const terrainInfo = findJitterTerrain(
      terrain,
      (steps[steps.length - 2] || steps[steps.length - 1]).point,
      endNode.terrainInfo.point,
      navigationNeeded ? 1.5 : 0.8
    );
    if (terrainInfo) {
      steps[steps.length - 1] = terrainInfo;
    }
  }
  return {
    steps,
    progress: 0,
    path,
    endNode
  };
};