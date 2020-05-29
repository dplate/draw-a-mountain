import walkToPoint from "../../lib/walkToPoint.js";

export default (guestGroup, elapsedTime) => {
  let allAtChair = true;
  guestGroup.guests.forEach((guest) => {
    if (!walkToPoint(guest.person, guest.chair.point, elapsedTime)) {
      allAtChair = false;
    }
  });
  if (allAtChair) {
    guestGroup.guests.forEach((guest) => {
      guest.person.animation = 'standing';
      guest.person.direction = guest.chair.direction;
      guest.person.position.z += (guest.chair.direction === 'front' ? 0.0005 : 0.0007);
    });
  }
  return allAtChair;
};

