import findNearestTerrain from '../lib/findNearestTerrain.js';
import createInstancedObjectFromSvg from '../lib/createInstancedObjectFromSvg.js';

const SCALE_CAPRICORN = 0.015;
const WALK_DISTANCE = 0.15;

const zAxis = new THREE.Vector3(0, 0, 1);
const steps = [];
for (let i = 0; i < 10; i++) {
  steps.push(new THREE.Vector3());
}
const tangent = new THREE.Vector3();
const checkPoint = new THREE.Vector2();
checkPoint.y = 10;

const calculateRandomCurve = (terrain, direction) => {
  const startX = WALK_DISTANCE + Math.random() * (1 - WALK_DISTANCE * 2);
  for (let index = 0; index < steps.length; index++) {
    const step = steps[index];
    const walkFactor = index / (steps.length - 1);
    checkPoint.x = startX + walkFactor * WALK_DISTANCE * direction;
    const terrainInfo = findNearestTerrain(terrain, checkPoint);
    if (Math.abs(terrainInfo.normal.x) > 0.75) {
      return null;
    }
    step.copy(terrainInfo.point);
    step.y = step.y - SCALE_CAPRICORN + SCALE_CAPRICORN * 0.9 * Math.sin(walkFactor * Math.PI);
    step.z = (index === 0 ? step.z - 3 : steps[index - 1].z);
  }
  return new THREE.CatmullRomCurve3(steps);
}

const createCapricorns = (instancedCapricorn) => {
  const capricorns = [];
  for (let i = 0; i < 3; i++) {
    const capricorn = instancedCapricorn.addInstance();
    capricorn.scale.y = (i === 0 ? SCALE_CAPRICORN : (0.5 + Math.random() * 0.5) * SCALE_CAPRICORN);
    capricorn.userData.distance = i * (0.1 + Math.random() * 0.05);
    capricorns.push(capricorn);
  }
  return capricorns;
}

export default async (scene, sound, terrain, dispatcher) => {
  const instancedCapricorn = await createInstancedObjectFromSvg(scene, 'animals/capricorn');
  instancedCapricorn.mesh.geometry.translate(0, 0.7, 0);
  instancedCapricorn.mesh.visible = false;
  const capricorns = createCapricorns(instancedCapricorn);

  const rocksAudio = await sound.loadAudio('animals/capricorn');
  capricorns[0].add(rocksAudio);

  let waitTime = Math.random() * 60000;
  let direction = 1;
  let currentWalkFactor = 0;
  let action = 'WAITING';
  let curve = null;

  dispatcher.listen('capricorn', 'animate', async ({elapsedTime}) => {
    switch (action) {
      case 'WAITING':
        waitTime -= elapsedTime;
        if (waitTime < 0) {
          direction = Math.random() < 0.5 ? -1 : 1;
          curve = calculateRandomCurve(terrain, direction);
          if (curve) {
            currentWalkFactor = 0;
            instancedCapricorn.mesh.visible = true;
            capricorns.forEach(capricorn => capricorn.scale.x = -1 * capricorn.scale.y * direction);
            action = 'WALKING';
          } else {
            waitTime = 5000;
          }
        }
        break;
      case 'WALKING':
        const elapsedWalkFactor = elapsedTime * 0.00001;
        if (currentWalkFactor < 0.5 &&
          currentWalkFactor + elapsedWalkFactor > 0.5 &&
          !rocksAudio.isPlaying) {
          rocksAudio.play();
        }

        currentWalkFactor += elapsedWalkFactor;
        if (currentWalkFactor > 1.5) {
          waitTime = Math.random() * 60000;
          instancedCapricorn.mesh.visible = false;
          action = 'WAITING';
        } else {
          capricorns.forEach(capricorn => {
            const capricornWalkFactor = Math.max(0, Math.min(currentWalkFactor - capricorn.userData.distance, 1));
            curve.getPointAt(capricornWalkFactor, capricorn.position);
            curve.getTangentAt(capricornWalkFactor, tangent);
            const angle = Math.atan(tangent.y / tangent.x);
            capricorn.quaternion.setFromAxisAngle(zAxis, angle);
            capricorn.update();
          });
        }
        break;
    }
  });
}