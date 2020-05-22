import initNavigateData from "./initNavigateData.js";
import navigate from "./navigate.js";
import getPersonDirection from "../../lib/getPersonDirection.js";
import calculateOpticalDistance from "../../lib/calculateOpticalDistance.js";
import handlePassing from "./handlePassing.js";

const calculateSpeed = (lastStep, nextStep, baseSpeed) => {
  const slope = (nextStep.point.y - lastStep.point.y) / nextStep.point.distanceTo(lastStep.point);
  const speedFactor = Math.min(Math.max(0.25, 1 - slope), 1.5);
  return baseSpeed * speedFactor;
};

export default (terrain, hikers, hiker, elapsedTime) => {
  const lastStepIndex = Math.floor(hiker.data.progress);
  const lastStep = hiker.data.steps[lastStepIndex];
  const nextStepIndex = lastStepIndex + 1;
  let nextStep = hiker.data.steps[nextStepIndex];
  if (nextStep) {
    handlePassing(terrain, hikers, hiker);
    const opticalDistance = calculateOpticalDistance(lastStep.point, nextStep.point);

    hiker.person.animation = 'walking';
    hiker.person.position.lerpVectors(lastStep.point, nextStep.point, hiker.data.progress % 1);
    hiker.person.direction = getPersonDirection(hiker.person.position, nextStep.point);
    hiker.person.speed = calculateSpeed(lastStep, nextStep, hiker.person.baseSpeed);

    hiker.data.progress += elapsedTime * hiker.person.speed * (0.005 / opticalDistance);
    return 'walk';
  } else {
    if (hiker.data.endNode.exit) {
      hiker.resolve();
    }
    hiker.data = initNavigateData(hiker.data.endNode);
    return 'navigate';
  }
};