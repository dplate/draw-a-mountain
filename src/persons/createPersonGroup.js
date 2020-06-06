import createPerson from './createPerson.js';

export default (scene, parts) => {
  const group = [];
  for (let i = 0; i < 1 + Math.floor(Math.random() * 3); i++) {
    const navigator = i === 0;
    let baseSpeed, scale, maxDifficulity;
    if (i > 0 && Math.random() < 0.5) {
      scale = 0.6 + Math.random() * 0.2;
      baseSpeed = Math.random() < 0.25 ? 0.0005 : 0.0015;
      maxDifficulity = 1;
    } else {
      baseSpeed = 0.0005 + Math.random() * 0.001;
      scale = 0.8 + Math.random() * 0.2;
      if (baseSpeed < 0.00075) {
        maxDifficulity = 0;
      } else if (baseSpeed > 0.001) {
        maxDifficulity = 2;
      } else {
        maxDifficulity = 1;
      }
    }
    const person = createPerson(scene, parts, navigator, baseSpeed, scale, maxDifficulity);
    group.push(person);
  }
  return group;
};