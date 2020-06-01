export default (train) => {
  let allOffBoard = true;
  train.data.passengers.forEach(passenger => {
    switch (passenger.action) {
      case 'drive':
        passenger.action = 'walkToExit';
        allOffBoard = false;
        break;
      case 'walkToExit':
      case 'getOut':
        allOffBoard = false;
        break;
    }
  });
  return allOffBoard;
}