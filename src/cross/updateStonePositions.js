import findNearestTerrain from '../lib/findNearestTerrain.js';

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

export default (terrain, crossMesh, instancedStone, stones) => {
  instancedStone.mesh.visible = true;
  const crossPoint = crossMesh.userData.navigationData.crossPoint;
  const seats = [];
  placeStones(terrain, crossPoint, stones, seats);

  crossMesh.userData.navigationData.entranceTerrainInfo = createEntranceTerrainInfo(terrain, crossPoint);
  crossMesh.userData.navigationData.seats = seats;
}