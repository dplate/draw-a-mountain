export default (group, nodes) => {
  const maxDifficulty = group.reduce(
    (maxDifficulty, person) => Math.min(person.maxDifficulty, maxDifficulty),
    2
  );

  const visits = [];
  nodes.forEach(node => {
    node.paths.forEach(path => {
      let visit = visits.find(visit => visit.path === path);
      if (!visit) {
        visit = {
          path,
          lastSeen: Date.now()
        };
        if (visit.path.routeDifficulty <= maxDifficulty) {
          visits.push(visit);
        }
      }
    });
    node.entrances.forEach(entrance => {
      let visit = visits.find(visit => visit.entrance === entrance);
      if (!visit) {
        visit = {
          entrance: entrance,
          lastSeen: Date.now() + (entrance.type === 'train' ? 1000 : 0)
        };
        visits.push(visit);
      }
    });
  });
  return visits;
};