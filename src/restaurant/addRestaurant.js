import loadSvg from '../lib/loadSvg.js';
import setOpacityForAll from '../lib/setOpacityForAll.js';
import createGuestHandler from './guests/createGuestHandler.js';
import updateRestaurantPosition from './updateRestaurantPosition.js';
import getConstructionSound from '../lib/getConstructionSound.js';

const emitSmokeParticle = (smoke, backMesh, elapsedTime) => {
  backMesh.userData.countdownForNextSmokeParticle -= elapsedTime;
  if (backMesh.userData.countdownForNextSmokeParticle < 0) {
    const position = backMesh.position.clone();
    position.x -= 0.07 * 0.26;
    position.y -= 0.07 * 0.13;
    const maxLifeTime = 10000 + Math.random() * 5000;
    const maxScale = 0.01 + Math.random() * 0.01;
    smoke.add(position, 0.005, maxScale, maxLifeTime);

    backMesh.userData.countdownForNextSmokeParticle += 1000 + Math.random() * 1000;
  }
};

const setTip = (tip, terrain) => {
  const path = new THREE.Path();
  const point = new THREE.Vector3(0.3, 10, 0);
  const terrainInfo = terrain.findNearestTerrainInfo(point);
  path.moveTo(terrainInfo.point.x, terrainInfo.point.y * 0.5);
  path.lineTo(terrainInfo.point.x + 0.005, terrainInfo.point.y * 0.5);
  tip.setTip(path, 2000);
};

export default async ({scene, audio, dispatcher}, freightTrain, tip, smoke, terrain) => {
  return new Promise(async resolve => {
    const supportMesh = await loadSvg('restaurant/restaurant-support');
    supportMesh.visible = false;
    scene.add(supportMesh);
    const backMesh = await loadSvg('restaurant/restaurant-back');
    backMesh.visible = false;
    backMesh.userData = {
      countdownForNextSmokeParticle: 0,
      constructionSound: await getConstructionSound(audio),
      ambientSound: await audio.load('restaurant/ambient', true)
    };
    scene.add(backMesh);

    const frontMesh = await loadSvg('restaurant/restaurant-front');
    frontMesh.visible = false;
    scene.add(frontMesh);

    let placed = false;

    await freightTrain.deliver(['stone', 'wood', 'parasol']);
    setTip(tip, terrain);

    dispatcher.listen('restaurant', 'touchStart', ({point}) => {
      if (!freightTrain.isStarting()) {
        placed = updateRestaurantPosition(terrain, supportMesh, backMesh, frontMesh, point);
      }
    });

    dispatcher.listen('restaurant', 'touchMove', ({point}) => {
      if (!freightTrain.isStarting()) {
        placed = updateRestaurantPosition(terrain, supportMesh, backMesh, frontMesh, point);
      }
    });

    dispatcher.listen('restaurant', 'touchEnd', async () => {
      if (placed) {
        backMesh.userData.constructionSound.playAtPosition(backMesh.position, true);
        setOpacityForAll([supportMesh, backMesh, frontMesh], 1);

        if (!freightTrain.isWaitingForStart()) {
          await freightTrain.giveSignal();

          dispatcher.stopListen('restaurant', 'touchStart');
          dispatcher.stopListen('restaurant', 'touchMove');
          dispatcher.stopListen('restaurant', 'touchEnd');

          const guestHandler = createGuestHandler();

          dispatcher.listen('restaurant', 'animate', ({elapsedTime}) => {
            emitSmokeParticle(smoke, backMesh, elapsedTime);
            guestHandler.updateGuests(elapsedTime);
          });

          const entrance = {
            terrainInfo: frontMesh.userData.navigationData.entranceTerrainInfo,
            type: 'restaurant'
          };
          entrance.handlePersonGroup = guestHandler.handlePersonGroup.bind(
            null, terrain, entrance, frontMesh.userData.navigationData, backMesh.userData.ambientSound
          );

          resolve({entrances: [entrance]});
        }
      }
    });
  });
};