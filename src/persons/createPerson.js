import getRandomFromList from "../lib/getRandomFromList.js";
import getRandomColors from "./getRandomColors.js";
import clonePersonMeshes from "./clonePersonMeshes.js";

const getRandomMeshes = (scene, parts) => {
  const body = getRandomFromList(parts.bodies);
  const head = getRandomFromList(parts.heads);
  const leg = getRandomFromList(parts.legs);
  const arm = getRandomFromList(parts.arms);

  const colors = getRandomColors();
  return clonePersonMeshes(scene, body, head, leg, arm, colors);
};

const chooseDirectionMeshes = (allMeshes, direction) => {
  Object.values(allMeshes).forEach(meshes => {
    Object.keys(meshes).forEach(meshDirection => meshes[meshDirection].visible = meshDirection === direction);
  });
};

export default (scene, parts, navigator, baseSpeed, scale, maxDifficulty) => {
  const meshes = getRandomMeshes(scene, parts);

  const person = {
    body: {meshes: meshes.body},
    head: {meshes: meshes.head},
    leftLeg: {meshes: meshes.leftLeg, angle: 0},
    rightLeg: {meshes: meshes.rightLeg, angle: 0},
    leftArm: {meshes: meshes.leftArm, angle: 0},
    rightArm: {meshes: meshes.rightArm, angle: 0},
    position: new THREE.Vector3(),
    scale,
    animation: 'standing',
    direction: null,
    cycle: 0,
    navigator,
    baseSpeed,
    speed: baseSpeed,
    maxDifficulty: maxDifficulty,
  };

  person.setDirection = (newDirection) => {
    if (person.direction !== newDirection) {
      chooseDirectionMeshes(meshes, newDirection);
      person.direction = newDirection;
    }
  }
  person.setDirection('left');

  return person;
};