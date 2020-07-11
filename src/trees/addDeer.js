import loadSvg from '../lib/loadSvg.js';
import getRandomFromList from '../lib/getRandomFromList.js';
import {MIN_Z} from '../lib/constants.js';

const SCALE_DEER = 0.015;

export default async (scene, sound, trees, dispatcher) => {
  const possibleTrees = trees.filter(tree =>
    (tree.userData.type === 'leaf' || tree.userData.type === 'fir') && tree.scale.y > 0
  );
  if (possibleTrees.length <= 0) {
    return;
  }
  const deer = await loadSvg('animals/deer');
  scene.add(deer);
  deer.geometry.translate(-0.5, 1.2, 0);
  deer.scale.y = SCALE_DEER;
  deer.visible = false;

  const deerAudio = await sound.loadAudio('animals/deer');
  deer.add(deerAudio);

  let waitTime = Math.random() * 60000;
  let direction = 1;
  let currentWalkFactor = 0;
  let action = 'WAITING';

  dispatcher.listen('deer', 'animate', async ({elapsedTime}) => {
    switch (action) {
      case 'WAITING':
        waitTime -= elapsedTime;
        if (waitTime < 0) {
          direction = Math.random() < 0.5 ? -1 : 1;
          const tree = getRandomFromList(possibleTrees);
          currentWalkFactor = 0;
          deer.position.copy(tree.userData.terrainPoint);
          deer.position.z -= MIN_Z * 10;
          deer.visible = true;
          deer.scale.x = 0;
          action = 'WALKING';
        }
        break;
      case 'WALKING':
        const elapsedWalkFactor = elapsedTime * 0.00001;
        if (currentWalkFactor < 0.4 &&
          currentWalkFactor + elapsedWalkFactor > 0.4 &&
          !deerAudio.isPlaying) {
          deerAudio.play();
        }

        currentWalkFactor += elapsedWalkFactor;
        if (currentWalkFactor > 1) {
          waitTime = Math.random() * 60000;
          deer.visible = false;
          action = 'WAITING';
        } else {
          deer.scale.x = SCALE_DEER * direction * Math.sin(currentWalkFactor * Math.PI) * -1;
        }
        break;
    }
  });
}