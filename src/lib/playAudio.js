export default audio => {
  if (audio.isPlaying) {
    audio.stop();
  }
  audio.play();
};