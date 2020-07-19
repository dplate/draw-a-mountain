const SCALE_STUMP = 0.005;
const SCALE_SAUSAGE = 0.01;

const createEntranceTerrainInfo = (terrain, fireplacePoint) => {
  const testPoint = fireplacePoint.clone();
  testPoint.x -= 0.005;
  testPoint.y -= 0.01;
  return terrain.findNearestTerrainInfo(testPoint);
};

const createFireplacePreparationPoint = (terrain, fireplacePoint) => {
  const testPoint = fireplacePoint.clone();
  testPoint.y -= 0.003;
  return terrain.findNearestTerrainInfo(testPoint).point;
};

const placeSausage = (sausage, point, direction) => {
  sausage.scale.x = SCALE_SAUSAGE * (direction === 'right' ? 1 : -1);
  sausage.scale.y = SCALE_SAUSAGE;
  sausage.position.copy(point);
  sausage.position.x += sausage.scale.x * 0.7 - 1;
  sausage.position.y += SCALE_SAUSAGE;
};

const createSeat = (sausage, point, direction) => {
  return {
    position: point,
    direction: direction,
    taken: false,
    showSausage: () => {
      sausage.position.x += 1;
      sausage.update();
    },
    hideSausage: () => {
      sausage.position.x -= 1;
      sausage.update();
    }
  }
};

const placeStumps = (terrain, fireplacePoint, {stumps, sausages, navigationData}) => {
  navigationData.seats = [];
  stumps.forEach((stump, index) => {
    const sausage = sausages[index];
    const direction = (index < stumps.length / 2) ? 'right' : 'left'
    stump.scale.x = SCALE_STUMP;
    stump.scale.y = SCALE_STUMP;
    stump.position.copy(fireplacePoint);
    stump.position.x += (0.0125 + Math.random() * 0.005) * (direction === 'right' ? -1 : 1);
    stump.position.z += (0.06 + Math.random() * 0.02) * (index % 2 ? -1 : 1);
    const terrainPoint = terrain.getTerrainPointAtPoint(stump.position, true) || stump.position;
    if (terrainPoint.y - fireplacePoint.y > -0.01 ||
      (index === stumps.length - 1 && navigationData.seats.length === 0)) {
      stump.position.copy(terrainPoint);
      stump.position.y += SCALE_STUMP * 0.7;
      placeSausage(sausage, terrainPoint, direction);
      navigationData.seats.push(createSeat(sausage, terrainPoint, direction));
    } else {
      stump.position.x = -1;
      sausage.position.x = -1;
    }
    stump.update();
    sausage.update();
  });
};

export default (terrain, resources) => {
  const fireplacePoint = resources.navigationData.fireplacePoint;
  resources.navigationData.fireplacePreparationPoint = createFireplacePreparationPoint(terrain, fireplacePoint);
  resources.navigationData.entranceTerrainInfo = createEntranceTerrainInfo(terrain, fireplacePoint);
  placeStumps(terrain, fireplacePoint, resources);

  resources.instancedStump.mesh.visible = true;
  resources.instancedSausage.mesh.visible = true;
};