import calculateOpticalDistance from '../../lib/calculateOpticalDistance.js';
import getRandomFromList from '../../lib/getRandomFromList.js';

export default (summiteers, seats) => {
  const freeSeats = seats.filter(seat => !seat.taken);
  if (freeSeats.length < summiteers.length) {
    return false;
  }

  const center = getRandomFromList(freeSeats).position;
  const sortedByDistance = freeSeats.sort((seat1, seat2) => {
    return calculateOpticalDistance(center, seat1.position) - calculateOpticalDistance(center, seat2.position)
  });

  summiteers.forEach((summiteer, index) => {
    summiteer.seat = sortedByDistance[index];
    summiteer.seat.taken = true;
    summiteer.seatPoint = summiteer.seat.position;
  });

  return true;
};