const animateRucksack = (rucksack, onBack) => {
  if (rucksack) {
    rucksack.onBack = onBack;
    if (!onBack) {
      Object.keys(rucksack.meshes).forEach(meshDirection => rucksack.meshes[meshDirection].visible = meshDirection === 'back');
    }
  }
}

const animateWalking = (person, elapsedTime) => {
  person.cycle = (person.cycle + elapsedTime * person.speed) % 1;

  const maxLegAngle = Math.PI / 8;
  const legAngle = Math.sin(person.cycle * 2 * Math.PI) * maxLegAngle;
  person.leftLeg.angle = legAngle;
  person.rightLeg.angle = -legAngle;

  const maxArmAngle = Math.PI / 10;
  const armAngle = -Math.sin(person.cycle * 2 * Math.PI) * maxArmAngle;
  person.leftArm.angle = armAngle;
  person.rightArm.angle = -armAngle;

  animateRucksack(person.rucksack, true);
};

const animateClimbing = (person, elapsedTime) => {
  person.cycle = (person.cycle + elapsedTime * person.speed) % 1;

  const averageLegAngle = -Math.PI / 10;
  const legAngle = Math.sin(person.cycle * 2 * Math.PI) * Math.PI / 10;
  person.leftLeg.angle = averageLegAngle + legAngle;
  person.rightLeg.angle = averageLegAngle - legAngle;

  const averageArmAngle = -Math.PI / 4;
  const armAngle = +Math.sin(person.cycle * 2 * Math.PI) * Math.PI / 10;
  person.leftArm.angle = averageArmAngle + armAngle;
  person.rightArm.angle = averageArmAngle - armAngle;

  animateRucksack(person.rucksack, true);
};

const animateStanding = (person) => {
  person.cycle = 0;
  person.leftLeg.angle = 0;
  person.rightLeg.angle = 0;
  person.leftArm.angle = 0;
  person.rightArm.angle = 0;

  animateRucksack(person.rucksack, true);
};

const animateSitting = (person) => {
  person.cycle = 0;
  const legAngle = -0.4 * Math.PI;
  const armAngle = -0.2 * Math.PI;
  person.leftLeg.angle = legAngle;
  person.rightLeg.angle = legAngle;
  person.leftArm.angle = armAngle;
  person.rightArm.angle = armAngle;

  animateRucksack(person.rucksack, false);
};

const animateEating = (person, elapsedTime) => {
  person.cycle -= elapsedTime * 0.005;
  if (person.cycle < 0) {
    person.cycle = 2 * Math.PI + 20 + Math.random() * 50;
  }

  const legAngle = -0.4 * Math.PI;

  const armMovement = (person.cycle <= 2 * Math.PI) ? ((1 - Math.cos(person.cycle)) / 2) : 0;
  const armAngle = -0.3 * Math.PI - 0.1 * Math.PI * armMovement;

  person.leftLeg.angle = legAngle;
  person.rightLeg.angle = legAngle;
  person.leftArm.angle = armAngle;
  person.rightArm.angle = armAngle;

  animateRucksack(person.rucksack, false);
};

const animatePointing = (person) => {
  person.cycle = 0;
  person.leftLeg.angle = 0;
  person.rightLeg.angle = 0;
  person.leftArm.angle = 0;
  person.rightArm.angle = -0.4 * Math.PI;

  animateRucksack(person.rucksack, true);
};

export default async (person, elapsedTime) => {
  switch (person.animation) {
    case 'walking':
      animateWalking(person, elapsedTime);
      break;
    case 'climbing':
      animateClimbing(person, elapsedTime);
      break;
    case 'standing':
      animateStanding(person);
      break;
    case 'sitting':
      animateSitting(person);
      break;
    case 'eating':
      animateEating(person, elapsedTime);
      break;
    case 'pointing':
      animatePointing(person);
      break;
  }
};