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
          lastSeen: 0
        };
        if (visit.path.routeDifficulty <= maxDifficulty) {
          visits.push(visit);
        }
      }
    });
    if (node.entrance) {
      let visit = visits.find(visit => visit.entrance === node.entrance);
      if (!visit) {
        visit = {
          entrance: node.entrance,
          lastSeen: 0
        };
        visits.push(visit);
      }
    }
  });

  return visits;
};