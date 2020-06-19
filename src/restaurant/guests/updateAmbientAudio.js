export default (ambientAudio, tables) => {
  const tableWithMoreThanOnePerson = tables.find(table => {
    const takenChairs = table.filter(chair => chair.taken);
    return takenChairs.length > 1;
  });
  if (tableWithMoreThanOnePerson) {
    if (!ambientAudio.isPlaying) {
      ambientAudio.play();
    }
  } else {
    if (ambientAudio.isPlaying) {
      ambientAudio.stop();
    }
  }
};