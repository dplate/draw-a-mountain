export default (node) => {
  return {
    node,
    navigationTimeLeft: (node.paths.length !== 2 || node.entrance) ? 5000 : 0
  };
};