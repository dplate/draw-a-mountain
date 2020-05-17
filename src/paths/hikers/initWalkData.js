import findNearestTerrain from "../../lib/findNearestTerrain.js";

const jitterPosition = new THREE.Vector3();
const direction = new THREE.Vector3();
const zVector = new THREE.Vector3(0, 0, 1);

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
  const navigationNeeded = endNode.paths.length !== 2 || endNode.entrance;
  const waitingNeeded = hiker.group.length > 1 && !isSlowestHiker(hiker);
  if (navigationNeeded || waitingNeeded) {
    direction.subVectors(steps[steps.length - 1].point, steps[steps.length - 2].point);
    const maxJitter = navigationNeeded ? 1.5 : 0.8;
    const angle = Math.PI * (Math.random() * maxJitter - maxJitter / 2);
    direction.applyAxisAngle(zVector, angle);
    jitterPosition.addVectors(endNode.terrainInfo.point, direction);
    const terrainInfo = findNearestTerrain(terrain, jitterPosition);
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