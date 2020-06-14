export default (camera, dispatcher) => {
  const listener = new THREE.AudioListener();
  camera.add(listener);
  const audioLoader = new THREE.AudioLoader();

  ['touchStart', 'touchMove', 'touchEnd', 'resume'].forEach(eventName => {
    dispatcher.listen('sound', eventName, () => {
      listener.context.resume();
    });
  });

  dispatcher.listen('sound', 'pause', () => {
    listener.context.suspend();
  });

  return {
    listener,
    loadAudio: name => {
      return new Promise(resolve => {
        const audio = new THREE.PositionalAudio(listener);
        audioLoader.load('assets/' + name + '.mp3', buffer => {
          audio.setBuffer(buffer);
          resolve(audio);
        });
      });
    }
  }
};