export default (ambientSound, tables) => {
  const tableWithMoreThanOnePerson = tables.find(table => {
    const takenChairs = table.filter(chair => chair.taken);
    return takenChairs.length > 1;
  });
  if (tableWithMoreThanOnePerson) {
    ambientSound.playAtPosition(tableWithMoreThanOnePerson[0].point);
  } else {
    ambientSound.stop();
  }
};