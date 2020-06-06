import walkToPoint from '../../lib/walkToPoint.js';

export default (guestGroup, elapsedTime) => {
  let allAtChair = true;
  guestGroup.guests.forEach((guest) => {
    if (guest.person.animation !== 'sitting') {
      if (!walkToPoint(guest.person, guest.chair.point, elapsedTime)) {
        allAtChair = false;
      } else {
        guest.person.animation = 'sitting';
        guest.person.setDirection(guest.chair.direction);
        guest.person.position.y -= (0.001 - (1.0 - guest.person.scale) * 0.005);
        guest.person.position.z += (guest.chair.direction === 'front' ? 0.0005 : 0.0007);
      }
    }
  });
  return allAtChair;
};

