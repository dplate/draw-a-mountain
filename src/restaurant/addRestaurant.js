import loadSvg from '../lib/loadSvg.js';
import setOpacityForAll from '../lib/setOpacityForAll.js';
import createGuestHandler from './guests/createGuestHandler.js';
import updateRestaurantPosition from './updateRestaurantPosition.js';

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
}

export default async (scene, menu, smoke, terrain, dispatcher) => {
  return new Promise(async resolve => {
    const supportMesh = await loadSvg('restaurant/restaurant-support');
    supportMesh.visible = false;
    scene.add(supportMesh);
    const backMesh = await loadSvg('restaurant/restaurant-back');
    backMesh.visible = false;
    backMesh.userData = {countdownForNextSmokeParticle: 0};
    scene.add(backMesh);
    const frontMesh = await loadSvg('restaurant/restaurant-front');
    frontMesh.visible = false;
    scene.add(frontMesh);

    let placed = false;
    let waitingForNext = false;

    dispatcher.listen('restaurant', 'touchStart', ({point}) => {
      if (!menu.isOnMenu(point)) {
        placed = updateRestaurantPosition(terrain, supportMesh, backMesh, frontMesh, point);
      }
    });

    dispatcher.listen('restaurant', 'touchMove', ({point}) => {
      if (!menu.isOnMenu(point)) {
        placed = updateRestaurantPosition(terrain, supportMesh, backMesh, frontMesh, point);
      }
    });

    dispatcher.listen('restaurant', 'touchEnd', async () => {
      if (placed) {
        setOpacityForAll([supportMesh, backMesh, frontMesh], 1);

        if (!waitingForNext) {
          waitingForNext = true;
          await menu.waitForNext();

          dispatcher.stopListen('restaurant', 'touchStart');
          dispatcher.stopListen('restaurant', 'touchMove');
          dispatcher.stopListen('restaurant', 'touchEnd');

          const guestHandler = createGuestHandler();

          dispatcher.listen('restaurant', 'animate', ({elapsedTime}) => {
            emitSmokeParticle(smoke, backMesh, elapsedTime);
            guestHandler.updateGuests(elapsedTime);
          });

          const entrance = {
            terrainInfo: frontMesh.userData.navigationData.entranceTerrainInfo
          };
          entrance.handlePersonGroup = guestHandler.handlePersonGroup.bind(
            null, terrain, entrance, frontMesh.userData.navigationData
          );

          resolve({entrances: [entrance]});
        }
      }
    });
  });
};