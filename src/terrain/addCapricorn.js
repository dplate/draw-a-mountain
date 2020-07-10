import loadSvg from '../lib/loadSvg.js';
import findNearestTerrain from '../lib/findNearestTerrain.js';

const SCALE_CAPRICORN = 0.015;
const WALK_DISTANCE = 0.15;

const zAxis = new THREE.Vector3(0, 0, 1);

export default async (scene, terrain, dispatcher) => {
  const capricorn = await loadSvg('animals/capricorn');
  capricorn.scale.x = SCALE_CAPRICORN;
  capricorn.scale.y = SCALE_CAPRICORN;
  capricorn.visible = false;
  scene.add(capricorn);

  let waitTime = Math.random() * 60000;
  let direction = 1;
  let currentWalkFactor = 0;
  let action = 'WAITING';
  const checkPoint = new THREE.Vector2();
  checkPoint.y = 10;
  const tangent = new THREE.Vector3();
  const steps = [];
  for (let i = 0; i < 5; i++) {
    steps.push(new THREE.Vector3());
  }
  let curve = null;

  dispatcher.listen('capricorn', 'animate', async ({elapsedTime}) => {
    switch (action) {
      case 'WAITING':
        waitTime -= elapsedTime;
        if (waitTime < 0) {
          const startX = WALK_DISTANCE + Math.random() * (1 - WALK_DISTANCE * 2);
          direction = Math.random() < 0.5 ? -1 : 1;
          steps.forEach((step, index) => {
            const walkFactor = index / (steps.length - 1);
            checkPoint.x = startX + walkFactor * WALK_DISTANCE * direction;
            step.copy(findNearestTerrain(terrain, checkPoint).point);
            step.y = step.y - SCALE_CAPRICORN * 0.2 + SCALE_CAPRICORN * Math.sin(walkFactor * Math.PI);
            step.z -= 1;
          });
          curve = new THREE.CatmullRomCurve3(steps);
          currentWalkFactor = 0;
          capricorn.visible = true;
          capricorn.scale.x = -1 * SCALE_CAPRICORN * direction;
          action = 'WALKING';
        }
        break;
      case 'WALKING':
        currentWalkFactor += elapsedTime * 0.00001;
        if (currentWalkFactor > 1) {
          waitTime = Math.random() * 60000;
          capricorn.visible = false;
          action = 'WAITING';
        } else {
          curve.getPointAt(currentWalkFactor, capricorn.position);
          curve.getTangentAt(currentWalkFactor, tangent);
          const angle = Math.atan(tangent.y / tangent.x);
          capricorn.setRotationFromAxisAngle(zAxis, angle);
        }
        break;
    }
  });
}