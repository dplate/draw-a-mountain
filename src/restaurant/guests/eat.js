export default (guestGroup, elapsedTime) => {
  guestGroup.waitTimeLeft -= elapsedTime;
  if (guestGroup.waitTimeLeft > 0) {
    return false;
  }
  guestGroup.guests.forEach(guest => guest.chair.taken = false);
  return true;
};