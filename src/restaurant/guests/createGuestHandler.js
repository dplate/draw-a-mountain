export default () => {
  let guestGroups = [];

  return {
    handlePersonGroup: async (entrance, navigationData, group) => {
      await new Promise((resolve) => {
        guestGroups.push({
          personGroup: group,
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
