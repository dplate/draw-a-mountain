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
    otherHiker.data.progress < hiker.data.progress;
};

const willOtherHikerPass = (hiker, otherHiker) => {
  return otherHiker.data.endNode !== hiker.data.endNode &&
    otherHiker.data.progress < hiker.data.steps.length - hiker.data.progress;
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

const createPassingSteps = (terrain, steps, startIndexToChange) => {
  direction.subVectors(steps[startIndexToChange].point, steps[startIndexToChange - 1].point);
  direction.applyAxisAngle(zVector, -Math.PI / 2);
  direction.multiplyScalar(0.7);
  for (let indexToChange = startIndexToChange; indexToChange <= steps.length - 1; indexToChange++) {
    passingPosition.addVectors(steps[indexToChange].point, direction);
    const terrainInfo = findNearestTerrain(terrain, passingPosition);
    if (terrainInfo) {
      steps[indexToChange] = terrainInfo;
    }
  }
};

export default (terrain, hikers, hiker, elapsedTime) => {
  const lastStepIndex = Math.floor(hiker.data.progress);
  const lastStep = hiker.data.steps[lastStepIndex];
  const nextStepIndex = lastStepIndex + 1;
  let nextStep = hiker.data.steps[nextStepIndex];
  if (nextStep) {
    if (nextStepIndex + 1 < hiker.data.steps.length && !hiker.data.passing && isOtherHikerApproaching(hikers, hiker)) {
      createPassingSteps(terrain, hiker.data.steps, nextStepIndex + 1);
      hiker.data.passing = true;
    }

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