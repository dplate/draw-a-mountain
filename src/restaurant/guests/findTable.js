export default (guestGroup, elapsedTime) => {
  if (guestGroup.waitTimeLeft > 0) {
    guestGroup.waitTimeLeft -= elapsedTime;
    return false;
  } else {
    const tableWithMostFreeChairs = guestGroup.navigationData.tables.map((table) => {
      return table.filter(chair => !chair.taken);
    }).sort((table1, table2) => {
      return table2.length - table1.length;
    })[0];

    if (tableWithMostFreeChairs.length >= guestGroup.guests.length) {
      guestGroup.guests.forEach((guest, index) => {
        tableWithMostFreeChairs[index].taken = true;
        guest.chair = tableWithMostFreeChairs[index];
      });
    }
    return true;
  }
};