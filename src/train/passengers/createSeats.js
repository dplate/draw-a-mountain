const createSeat = (carIndex, side, middle) => {
  const carCenterOffsetX = -0.026 - carIndex * 0.052;
  return {
    seatOffsetX: carCenterOffsetX + side * (0.01 - middle * 0.005),
    doorOffsetX: carCenterOffsetX + side * 0.02
  }
};

export default () => {
  const seats = [];
  for (let carIndex = 0; carIndex <= 1; carIndex++) {
    for (let side = -1; side <= 1; side += 2) {
      for (let middle = 0; middle <= 1; middle++) {
        seats.push(createSeat(carIndex, side, middle));
      }
    }
  }
  return seats;
};