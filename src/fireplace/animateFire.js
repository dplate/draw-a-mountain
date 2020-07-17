import {MIN_Z} from '../lib/constants.js';

const SCALE_SPARK = 0.01;

const scaleMesh = (mesh, scale) => {
  mesh.scale.y = scale * Math.abs(mesh.scale.x);
};

const flicker = (fire, elapsedTime) => {
  fire.userData.flicker += elapsedTime / 250;
  if (fire.userData.flicker > 1) {
    fire.scale.x *= -1;
    fire.userData.flicker = 0;
  }
};

const animateSparks = (fireplacePoint, sparks, strength, elapsedTime) => {
  sparks.forEach(spark => {
    spark.userData.lifeTime -= elapsedTime * spark.userData.lifeTimeSpeed;
    if (spark.userData.lifeTime <= 0) {
      const xFactor = Math.random() * Math.random();
      spark.position.copy(fireplacePoint);
      spark.userData.mirror = Math.random() < 0.5 ? -1 : 1;
      spark.scale.x = SCALE_SPARK * spark.userData.mirror;
      spark.scale.y = SCALE_SPARK;
      spark.position.x += xFactor * 0.006 * (Math.random() < 0.5 ? -1 : 1);
      spark.position.z += 5 * MIN_Z;
      spark.userData.lifeTime = 1;
      spark.userData.lifeTimeSpeed = 0.0003 + 0.007 * ((1 - strength) * Math.random());
      spark.userData.speed = 0.00001 * Math.random() * (1 - xFactor);
    } else {
      spark.position.y += elapsedTime * spark.userData.speed;
      spark.scale.x = spark.userData.lifeTime * SCALE_SPARK * spark.userData.mirror;
      spark.scale.y = spark.userData.lifeTime * SCALE_SPARK;
    }
    spark.update();
  });
}

export default (resources, elapsedTime) => {
  const {fireSound, woodBack, woodFront, fireplace, fire, instancedSpark, sparks} = resources;
  switch (fire.userData.status) {
    case 'stoking':
      woodBack.visible = true;
      woodFront.visible = true;
      fire.visible = true;
      instancedSpark.mesh.visible = true;
      fireSound.playAtPosition(fireplace.position);

      if (fire.userData.strength < 1) {
        scaleMesh(fire, fire.userData.strength);
        fire.userData.strength += elapsedTime / 20000;
        fire.userData.strength = Math.min(fire.userData.strength, 1);

        if (fire.userData.strength < 0.5) {
          scaleMesh(woodFront, (1 - 2 * fire.userData.strength));
          scaleMesh(woodBack, 1);
        } else {
          scaleMesh(woodBack, (1 - 2 * (fire.userData.strength - 0.5)));
        }
      } else {
        fire.userData.status = 'burning';
      }
      flicker(fire, elapsedTime);
      animateSparks(fireplace.position, sparks, fire.userData.strength, elapsedTime);
      break;
    case 'burning':
      flicker(fire, elapsedTime);
      animateSparks(fireplace.position, sparks, fire.userData.strength, elapsedTime);
      break;
    case 'burningOut':
      if (fire.userData.strength > 0) {
        scaleMesh(fire, fire.userData.strength);
        fire.userData.strength -= elapsedTime / 20000;
        fire.userData.strength = Math.max(fire.userData.strength, 0);
        flicker(fire, elapsedTime);
        animateSparks(fireplace.position, sparks, fire.userData.strength, elapsedTime);
      } else {
        scaleMesh(woodBack, 1);
        scaleMesh(woodFront, 1);
        woodBack.visible = false;
        woodFront.visible = false;
        fire.visible = false;
        instancedSpark.mesh.visible = false;
        fire.userData.status = 'burned'
        fireSound.stop();
      }
      break;
  }
};