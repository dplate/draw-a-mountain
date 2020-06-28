import findNearestTerrain from '../lib/findNearestTerrain.js';
import setOpacityForAll from '../lib/setOpacityForAll.js';

const SCALE_CROSS = 0.025;
const SCALE_STONE = 0.005;

const createEntranceTerrainInfo = (terrain, crossPoint) => {
  const testPoint = crossPoint.clone();
  testPoint.x += 0.005;
  testPoint.y -= 0.015;
  return findNearestTerrain(terrain, testPoint);
};

const placeStones = (terrain, crossPoint, stones, seats) => {
  stones.forEach(stone => {
    stone.scale.x = SCALE_STONE * (Math.random() < 0.5 ? -1 : 1);
    stone.scale.y = SCALE_STONE;
    stone.position.copy(crossPoint);
    stone.position.x += -0.02 + Math.random() * 0.04;
    stone.position.y += -0.02 + Math.random() * 0.03;
    const terrainInfo = findNearestTerrain(terrain, stone.position);
    stone.position.copy(terrainInfo.point);
    stone.position.y += SCALE_STONE * 0.5;
    stone.update();

    seats.push({
      position: terrainInfo.point,
      direction: terrainInfo.normal.x > 0 ? 'right' : 'left',
      taken: false
    });
  });
};

export default (terrain, crossMesh, instancedStone, stones, clickPoint) => {
  const terrainInfoCross = findNearestTerrain(terrain, clickPoint, 0.05, 0.025);
  if (terrainInfoCross) {
    setOpacityForAll([crossMesh, instancedStone.mesh], 0.25);

    crossMesh.visible = true;
    crossMesh.scale.x = SCALE_CROSS;
    crossMesh.scale.y = SCALE_CROSS;
    crossMesh.position.x = terrainInfoCross.point.x;
    crossMesh.position.y = terrainInfoCross.point.y + 1.6 * SCALE_CROSS;
    crossMesh.position.z = terrainInfoCross.point.z;

    instancedStone.mesh.visible = true;
    const seats = [];
    placeStones(terrain, terrainInfoCross.point, stones, seats);

    crossMesh.userData.navigationData = {
      crossPoint: terrainInfoCross.point,
      entranceTerrainInfo: createEntranceTerrainInfo(terrain, terrainInfoCross.point),
      seats
    };

    return true;
  }
  return false;
}