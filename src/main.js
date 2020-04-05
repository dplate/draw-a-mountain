import setup from "./setup.js";
import setupTerrain from "./terrain/setupTerrain.js";

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

const { scene } = setup(window, { onTouchStart, onTouchMove, onTouchEnd });

currentCallbacks.push(setupTerrain(scene));
