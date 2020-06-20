import calculateOpticalDistance from '../lib/calculateOpticalDistance.js';

const centerPoint = new THREE.Vector3();

export default (persons, point, maxDistance) => {
  const distanceInfos = persons.reduce((infos, person) => {
    centerPoint.copy(person.position);
    centerPoint.y += 0.007;
    const distance = calculateOpticalDistance(point, centerPoint);
    if (distance < maxDistance) {
      return [...infos, {
        person,
        distance
      }];
    }
    return infos;
  }, []);

  const nearestDistanceInfo = distanceInfos.sort(
    (info1, info2) => info1.distance - info2.distance
  )[0];
  return nearestDistanceInfo ? nearestDistanceInfo.person : null;
};