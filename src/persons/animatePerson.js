const animateWalking = (person, elapsedTime) => {
  person.cycle = (person.cycle + elapsedTime * person.baseSpeed) % 1;

  const maxLegAngle = Math.PI / 8;
  const legAngle = Math.sin(person.cycle * 2 * Math.PI) * maxLegAngle;
  person.leftLeg.angle = legAngle;
  person.rightLeg.angle = -legAngle;

  const maxArmAngle = Math.PI / 10;
  const armAngle = -Math.sin(person.cycle * 2 * Math.PI) * maxArmAngle;
  person.leftArm.angle = armAngle;
  person.rightArm.angle = -armAngle;
};

const animateStanding = (person) => {
  person.cycle = 0;
  person.leftLeg.angle = 0;
  person.rightLeg.angle = 0;
  person.leftArm.angle = 0;
  person.rightArm.angle = 0;
};

export default async (person, elapsedTime) => {
  switch (person.animation) {
    case "walking":
      animateWalking(person, elapsedTime);
      break;
    case "standing":
      animateStanding(person);
      break;
  }
};