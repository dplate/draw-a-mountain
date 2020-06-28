import walkGroupToPoint from '../../lib/walkGroupToPoint.js';
import {MIN_Z} from '../../lib/constants.js';

export default (eaters, elapsedTime) => {
  const nonSitters = eaters.filter(eater => eater.person.animation !== 'sitting');
  if (walkGroupToPoint(nonSitters, 'seatPoint', elapsedTime)) {
    nonSitters.forEach(eater => {
      eater.person.setDirection(eater.seat.direction);
      eater.person.animation = 'sitting';
      eater.person.position.y -= (0.001 - (1.0 - eater.person.scale) * 0.005);
      eater.person.position.z += MIN_Z;
    });
    return true;
  }
  return false;
};