import setup from "./setup.js";
import setupTerrain from "./terrain/setupTerrain.js";
import setupEnvironment from "./environment/setupEnvironment.js";

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

  currentCallbacks.push(await setupEnvironment(scene));
  currentCallbacks.push(setupTerrain(scene));
}

start();