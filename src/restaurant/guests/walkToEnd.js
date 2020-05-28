import walkToPoint from "../../lib/walkToPoint.js";

export default (guestGroup, elapsedTime) => {
  let allAtEnd = true;
  guestGroup.guests.forEach((guest) => {
    if (!walkToPoint(guest.person, guest.endPoint, elapsedTime)) {
      allAtEnd = false;
    }
  });
  return allAtEnd;
};

