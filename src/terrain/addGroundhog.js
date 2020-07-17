import loadSvg from '../lib/loadSvg.js';
import getRandomFromList from '../lib/getRandomFromList.js';
import {MIN_Z} from '../lib/constants.js';

const SCALE_GROUNDHOG = 0.003;
const HEIGHT_GROUNDHOG = 0.006;
const LOOKING_TIME = 10000;

const calculationPositionY = (rock, currentWalkFactor) => {
  return rock.userData.groundhogY - HEIGHT_GROUNDHOG +
    HEIGHT_GROUNDHOG * Math.sin(currentWalkFactor * Math.PI);
};

export default async (scene, audio, rocks, dispatcher) => {
  const possibleRocks = rocks.filter(rock => rock.userData.groundhogY);
  if (possibleRocks.length <= 0) {
    return;
  }
  const groundhog = await loadSvg('animals/groundhog');
  scene.add(groundhog);
  groundhog.geometry.translate(0, 1, 0);
  groundhog.scale.x = SCALE_GROUNDHOG;
  groundhog.scale.y = SCALE_GROUNDHOG;
  groundhog.visible = false;

  const groundhogSound = await audio.load('animals/groundhog');

  let waitTime = Math.random() * 60000;
  let currentWalkFactor = 0;
  let action = 'WAITING';
  let rock = null;

  dispatcher.listen('groundhog', 'animate', async ({elapsedTime}) => {
    switch (action) {
      case 'WAITING':
        waitTime -= elapsedTime;
        if (waitTime < 0) {
          rock = getRandomFromList(possibleRocks);
          currentWalkFactor = 0;
          groundhog.position.copy(rock.position);
          groundhog.position.y = rock.userData.groundhogY - 2 * HEIGHT_GROUNDHOG;
          groundhog.position.z -= MIN_Z * 10;
          groundhog.visible = true;
          action = 'SHOWING';
        }
        break;
      case 'SHOWING':
        currentWalkFactor += elapsedTime * 0.00001;
        if (currentWalkFactor > 0.5) {
          waitTime = LOOKING_TIME;
          groundhogSound.playAtPosition(groundhog.position);
          action = 'LOOKING';
        } else {
          groundhog.position.y = calculationPositionY(rock, currentWalkFactor);
        }
        break;
      case 'LOOKING':
        waitTime -= elapsedTime;
        groundhog.scale.x = SCALE_GROUNDHOG * ((waitTime > LOOKING_TIME / 2) ? 1 : -1);
        if (waitTime < 0) {
          action = 'HIDING';
        }
        break;
      case 'HIDING':
        currentWalkFactor += elapsedTime * 0.0001;
        if (currentWalkFactor > 1) {
          waitTime = Math.random() * 60000;
          groundhog.visible = false;
          action = 'WAITING';
        } else {
          groundhog.position.y = calculationPositionY(rock, currentWalkFactor)
        }
        break;
    }
  });
}