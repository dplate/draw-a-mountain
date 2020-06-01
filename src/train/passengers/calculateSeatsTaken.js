export default (train) => {
  return train.data.passengers.filter(otherPassenger => otherPassenger.seat !== null).length
}