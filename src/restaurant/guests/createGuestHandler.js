export default () => {
  let guestGroups = [];

  return {
    handlePersonGroup: async (entrance, group) => {
      await new Promise((resolve) => {
        guestGroups.push({
          persons: group,
          resolve
        });
      });
      guestGroups = guestGroups.filter(guestGroup => guestGroup.persons !== group);
      return entrance;
    },
    updateGuests: () => {
      guestGroups.forEach(guestGroup => {
        guestGroup.resolve();
      });
    }
  };
};
