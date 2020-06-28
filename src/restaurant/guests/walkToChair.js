import walkToPoint from '../../lib/walkToPoint.js';
import {MIN_PERSON_Z} from '../../lib/constants.js';

export default (guestGroup, elapsedTime) => {
  let allAtChair = true;
  guestGroup.guests.forEach((guest) => {
    if (guest.person.animation !== 'eating') {
      if (!walkToPoint(guest.person, guest.chair.point, elapsedTime)) {
        allAtChair = false;
      } else {
        guest.person.animation = 'eating';
        guest.person.setDirection(guest.chair.direction);
        guest.person.position.y -= (0.001 - (1.0 - guest.person.scale) * 0.005);
        guest.person.position.z += (guest.chair.direction === 'front' ? MIN_PERSON_Z : MIN_PERSON_Z * 2);
      }
    }
  });
  return allAtChair;
};

