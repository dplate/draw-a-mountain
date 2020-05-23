export default () => {
  let passengerGroups = [];

  return {
    handlePersonGroup: async (startEntrance, endEntrance, group) => {
      await new Promise((resolve) => {
        passengerGroups.push({
          persons: group,
          startEntrance,
          endEntrance,
          resolve
        });
      });
      passengerGroups = passengerGroups.filter(passengerGroup => passengerGroup.persons !== group);
      return endEntrance;
    },
    updatePassengers: () => {
      passengerGroups.forEach(passengerGroup => {
        passengerGroup.resolve();
      });
    }
  };
};
