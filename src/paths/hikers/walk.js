import initNavigateData from "./initNavigateData.js";
import navigate from "./navigate.js";
import getPersonDirection from "../../lib/getPersonDirection.js";
import calculateOpticalDistance from "../../lib/calculateOpticalDistance.js";
import handlePassing from "./handlePassing.js";

const calculateSlope = (lastStep, nextStep) => {
  return (nextStep.point.y - lastStep.point.y) / nextStep.point.distanceTo(lastStep.point);
};

const calculateSpeed = (difficulty, slope, baseSpeed) => {
  if (difficulty === 2) {
    return baseSpeed * 0.3;
  }
  const speedFactor = Math.min(Math.max(0.25, 1 - slope), 1.5);
  return baseSpeed * speedFactor;
};

const isClimbing = (difficulty, slope) => {
  return difficulty === 2 && Math.abs(slope) > 0.07;
};

const getDirection = (currentPoint, nextPoint, climbing, slope) => {
  if (climbing && slope < 0) {
    return getPersonDirection(nextPoint, currentPoint);
  }
  return getPersonDirection(currentPoint, nextPoint)
}

export default (terrain, hikers, hiker, elapsedTime) => {
  const lastStepIndex = Math.floor(hiker.data.progress);
  const lastStep = hiker.data.steps[lastStepIndex];
  const nextStepIndex = lastStepIndex + 1;
  let nextStep = hiker.data.steps[nextStepIndex];
  if (nextStep) {
    handlePassing(terrain, hikers, hiker);
    const opticalDistance = calculateOpticalDistance(lastStep.point, nextStep.point);
    const slope = calculateSlope(lastStep, nextStep);
    const difficulty = hiker.data.path.difficulty;
    const climbing = isClimbing(difficulty, slope);

    hiker.person.animation = climbing ? 'climbing' : 'walking';
    hiker.person.position.lerpVectors(lastStep.point, nextStep.point, hiker.data.progress % 1);
    hiker.person.setDirection(getDirection(hiker.person.position, nextStep.point, climbing, slope));
    hiker.person.speed = calculateSpeed(difficulty, slope, hiker.person.baseSpeed);

    hiker.data.progress += elapsedTime * hiker.person.speed * (0.005 / opticalDistance);
    return 'walk';
  } else {
    hiker.data = initNavigateData(hiker.data.endNode);
    return 'navigate';
  }
};