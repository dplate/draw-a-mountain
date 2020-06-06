import difficultyColors from './difficultyColors.js';

const collectPaths = (nodes) => {
  return nodes.reduce((paths, node) => {
    node.paths.forEach(path => {
      if (!paths.includes(path)) {
        path.routeDifficulty = path.difficulty;
        path.routeMesh.material.color = difficultyColors[path.difficulty];
        paths.push(path);
      }
    });
    return paths;
  }, []);
};

export default (nodes) => {
  const paths = collectPaths(nodes);
  let changes;
  do {
    changes = paths.reduce((currentChanges, path) => {
      const maxDifficulty = path.nodes.reduce((currentMin, node) => {
        const minNeighbourDifficulty = node.paths.reduce((currentNeighbourMin, neighbourPath) => {
          if (neighbourPath !== path) {
            return Math.min(currentNeighbourMin, neighbourPath.routeDifficulty);
          }
          return currentNeighbourMin;
        }, 10);
        if (node.entrances.length === 0 && minNeighbourDifficulty < 10) {
          return Math.max(currentMin, minNeighbourDifficulty);
        }
        return currentMin;
      }, 0);

      if (maxDifficulty !== path.routeDifficulty && maxDifficulty >= path.difficulty) {
        path.routeDifficulty = maxDifficulty;
        path.routeMesh.material.color = difficultyColors[maxDifficulty];
        return currentChanges + 1;
      }
      return currentChanges;
    }, 0);
  } while (changes > 0);
};