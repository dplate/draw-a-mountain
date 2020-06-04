export default (node) => {
  const navigationNeeded = (!node.entrance && node.paths.length !== 2) || (node.entrance && node.paths.length > 1);
  return {
    node,
    navigationTimeLeft: navigationNeeded ? 3000 : 0
  };
};