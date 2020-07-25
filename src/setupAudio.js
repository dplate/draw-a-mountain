import {ZOOM_WIDTH} from './lib/constants.js';
import calculateOpticalDistance from './lib/calculateOpticalDistance.js';

const FADE_OUT_DISTANCE = 0.5;

const createSound = (audioContext, audioBuffer, loop) => {
  let source = null;
  const gainNode = audioContext.createGain();
  gainNode.connect(audioContext.destination);
  const panNode = audioContext.createStereoPanner();
  panNode.connect(gainNode);
  const position = new THREE.Vector3(0.5, 0, 0);
  let zoomCenter = null;
  let volume = 1;

  const sound = {
    stop: () => {
      if (source !== null) {
        source.stop();
      }
    },
    setPlaybackRate: (rate) => {
      if (source) {
        source.playbackRate && (source.playbackRate.value = rate);
      }
    },
    setDetune: (detune) => {
      if (source) {
        source.detune && (source.detune.value = detune);
      }
    },
    updatePanAndGain: () => {
      if (source) {
        let relativeX = position.x * 2 - 1;
        let fadeOut = 0.7;
        if (zoomCenter) {
          relativeX = (position.x - zoomCenter.x) / ZOOM_WIDTH;
          const distance = calculateOpticalDistance(position, zoomCenter);
          fadeOut = Math.max(0.05, FADE_OUT_DISTANCE - distance);
        }
        panNode.pan.value = Math.max(-1, Math.min(relativeX, 1));
        gainNode.gain.value = Math.min(fadeOut, volume);
      }
    }
  };
  sound.play = (restart = false) => {
    if (source === null || (restart && sound.stop())) {
      source = audioContext.createBufferSource();
      source.connect(panNode);
      source.loop = loop;
      source.buffer = audioBuffer;
      source.onended = () => {
        source = null;
      };
      sound.updatePanAndGain();
      source.start();
    }
  };
  sound.playAtPosition = (newPosition, restart = false) => {
    sound.setPosition(newPosition);
    sound.play(restart);
  };
  sound.setPosition = (newPosition) => {
    if (position.x !== newPosition.x) {
      position.copy(newPosition);
      sound.updatePanAndGain();
    }
  };
  sound.setZoomCenter = (newZoomCenter) => {
    zoomCenter = newZoomCenter;
    sound.updatePanAndGain();
  };
  sound.setVolume = (newVolume) => {
    if (volume !== newVolume) {
      volume = newVolume;
      sound.updatePanAndGain();
    }
  };
  return sound;
};

export default (dispatcher) => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const loader = new THREE.FileLoader();
  loader.setResponseType('arraybuffer');
  const sounds = [];

  dispatcher.listen('audio', 'resume', () => {
    audioContext.resume();
  });

  dispatcher.listen('audio', 'pause', () => {
    audioContext.suspend();
  });

  const audio = {
    loadInstanced: (name) => {
      return new Promise(resolve => {
        loader.load('assets/' + name + '.mp3', async buffer => {
          const audioBuffer = await audioContext.decodeAudioData(buffer);
          resolve({
            addInstance: (loop = false) => {
              const sound = createSound(audioContext, audioBuffer, loop);
              sounds.push(sound);
              return sound;
            }
          });
        });
      });
    },
    setZoomCenter: (zoomCenter = null) => {
      sounds.forEach(sound => sound.setZoomCenter(zoomCenter));
    }
  };
  audio.load = async (name, loop = false) => {
    const instanced = await audio.loadInstanced(name);
    return instanced.addInstance(loop);
  };

  return audio;
};