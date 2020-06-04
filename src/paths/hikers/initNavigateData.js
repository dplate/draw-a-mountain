import isNavigationNeeded from "./isNavigationNeeded.js";

export default (node) => {
  return {
    node,
    navigationTimeLeft: isNavigationNeeded(node) ? 3000 : 0
  };
};