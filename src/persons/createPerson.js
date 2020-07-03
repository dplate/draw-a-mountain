import getRandomFromList from '../lib/getRandomFromList.js';
import getRandomColors from './getRandomColors.js';
import clonePersonMeshes from './clonePersonMeshes.js';

const getRandomMeshes = (scene, parts, navigator, scale) => {
  const body = getRandomFromList(parts.bodies);
  const head = getRandomFromList(parts.heads);
  const leg = getRandomFromList(parts.legs);
  const arm = getRandomFromList(parts.arms);
  const rucksack = navigator ? getRandomFromList(parts.rucksacks) : null;

  const colors = getRandomColors();
  return clonePersonMeshes(scene, scale, body, head, leg, arm, rucksack, colors);
};

const chooseDirectionMeshes = (allMeshes, direction) => {
  Object.values(allMeshes).forEach(meshes => {
    if (meshes !== null) {
      Object.keys(meshes).forEach(meshDirection => meshes[meshDirection].visible = meshDirection === direction);
    }
  });
};

export default (scene, parts, navigator, baseSpeed, scale, maxDifficulty) => {
  const meshes = getRandomMeshes(scene, parts, navigator, scale);

  const person = {
    body: {meshes: meshes.body},
    head: {meshes: meshes.head},
    leftLeg: {meshes: meshes.leftLeg, angle: 0},
    rightLeg: {meshes: meshes.rightLeg, angle: 0},
    leftArm: {meshes: meshes.leftArm, angle: 0},
    rightArm: {meshes: meshes.rightArm, angle: 0},
    rucksack: meshes.rucksack ? {meshes: meshes.rucksack, onBack: true} : null,
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