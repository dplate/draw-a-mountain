import initNavigateData from "./initNavigateData.js";
import navigate from "./navigate.js";
import getPersonDirection from "../../lib/getPersonDirection.js";
import calculateOpticalDistance from "../../lib/calculateOpticalDistance.js";
import findNearestTerrain from "../../lib/findNearestTerrain.js";

const passingPosition = new THREE.Vector3();
const direction = new THREE.Vector3();
const zVector = new THREE.Vector3(0, 0, 1);

const isOtherHikerOnSamePath = (hiker, otherHiker) =>
  otherHiker !== hiker &&
  otherHiker.action === 'walk' &&
  otherHiker.data.path === hiker.data.path;

const willOtherHikerOvertake = (hiker, otherHiker) => {
  return otherHiker.data.endNode === hiker.data.endNode &&
    otherHiker.person.baseSpeed > hiker.person.baseSpeed &&
    otherHiker.data.progress < hiker.data.progress &&
    hiker.data.progress - otherHiker.data.progress < 2;

};

const willOtherHikerPass = (hiker, otherHiker) => {
  return otherHiker.data.endNode !== hiker.data.endNode &&
    otherHiker.data.progress < (hiker.data.steps.length - hiker.data.progress) &&
    Math.abs((hiker.data.steps.length - hiker.data.progress) - otherHiker.data.progress) < 4;
};

const isOtherHikerApproaching = (hikers, hiker) => {
  return hikers.find(otherHiker => {
    if (isOtherHikerOnSamePath(hiker, otherHiker)) {
      if (willOtherHikerOvertake(hiker, otherHiker)) {
        return true;
      }
      if (willOtherHikerPass(hiker, otherHiker)) {
        return true;
      }
    }
    return false;
  });
};

const createPassingStep = (terrain, steps, passingStepIndex) => {
  direction.subVectors(steps[passingStepIndex].point, steps[passingStepIndex - 1].point);
  direction.applyAxisAngle(zVector, -Math.PI / 2);
  direction.multiplyScalar(0.7);
  passingPosition.addVectors(steps[passingStepIndex].point, direction);
  const terrainInfo = findNearestTerrain(terrain, passingPosition);
  if (terrainInfo) {
    steps[passingStepIndex] = terrainInfo;
    steps[passingStepIndex].passingStep = true;
  }
};

const handlePassing = (terrain, hikers, hiker) => {
  const passingStepIndex = Math.ceil(hiker.data.progress + 0.5);
  if (passingStepIndex < hiker.data.steps.length &&
    !hiker.data.steps[passingStepIndex].passingStep &&
    isOtherHikerApproaching(hikers, hiker)) {
    createPassingStep(terrain, hiker.data.steps, passingStepIndex);
  }
}

export default (terrain, hikers, hiker, elapsedTime) => {
  const lastStepIndex = Math.floor(hiker.data.progress);
  const lastStep = hiker.data.steps[lastStepIndex];
  const nextStepIndex = lastStepIndex + 1;
  let nextStep = hiker.data.steps[nextStepIndex];
  if (nextStep) {
    handlePassing(terrain, hikers, hiker);

    hiker.person.animation = 'walking';
    hiker.person.position.lerpVectors(lastStep.point, nextStep.point, hiker.data.progress % 1);
    hiker.person.direction = getPersonDirection(hiker.person.position, nextStep.point);

    hiker.data.progress += elapsedTime * hiker.person.baseSpeed *
      (0.005 / calculateOpticalDistance(lastStep.point, nextStep.point));
    return 'walk';
  } else {
    if (hiker.data.endNode.exit) {
      hiker.resolve();
    }
    hiker.data = initNavigateData(hiker.data.endNode);
    return 'navigate';
  }
};