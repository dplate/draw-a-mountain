export default (eaters, seats) => {
  const freeSeats = seats.filter(seat => !seat.taken);
  if (freeSeats.length < eaters.length) {
    return false;
  }

  eaters.forEach((eater, index) => {
    eater.seat = freeSeats[index];
    eater.seat.taken = true;
    eater.seatPoint = eater.seat.position;
  });

  return true;
};