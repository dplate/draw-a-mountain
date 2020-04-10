import setup from "./setup.js";
import addTerrain from "./terrain/addTerrain.js";
import addEnvironment from "./environment/addEnvironment.js";

const start = async () => {
  const currentCallbacks = [];

  const onTouchStart = (event) => {
    currentCallbacks.forEach((listener) => listener.onTouchStart && listener.onTouchStart(event))
  };

  const onTouchMove = (event) => {
    currentCallbacks.forEach((listener) => listener.onTouchMove && listener.onTouchMove(event))
  };

  const onTouchEnd = (event) => {
    currentCallbacks.forEach((listener) => listener.onTouchEnd && listener.onTouchEnd(event))
  };

  const onAnimate = (event) => {
    currentCallbacks.forEach((listener) => listener.onAnimate && listener.onAnimate(event))
  };

  const {scene} = setup(window, {onTouchStart, onTouchMove, onTouchEnd, onAnimate});

  currentCallbacks.push(await addEnvironment(scene));
  currentCallbacks.push(addTerrain(scene));
}

start();